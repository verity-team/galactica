import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { VerifySignatureDTO } from "./types/VerifySignature";
import { SiweMessage, generateNonce } from "siwe";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PrismaService } from "@/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { sign } from "jsonwebtoken";

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getNonce(): Promise<string> {
    let retry = 3;
    let nonce = "";

    while (retry > 0) {
      try {
        nonce = generateNonce();

        // Try to store nonce into database
        const saved = await this.storeNonce(nonce);
        if (!saved) {
          throw new Error();
        }
      } catch (error) {
        // When using generateNonce(), there is a small chance for it to generate a less-then-8-char nonce
        // generateNonce() will throw an error when that "small chance" occur
        retry--;
        continue;
      }

      if (nonce !== "") {
        return nonce;
      }
    }

    throw new InternalServerErrorException(
      "Cannot generate nonce. Please try again later",
    );
  }

  async verifySignature({
    message,
    signature,
  }: VerifySignatureDTO): Promise<string> {
    const siweMessage = new SiweMessage(message);

    const isMessageValid = await this.verifySiweMessage(siweMessage);
    if (!isMessageValid) {
      throw new ForbiddenException(
        "Invalid signature. Please try to sign-in again",
      );
    }

    // We can use the message nonce after we have verified it
    const result = await siweMessage.verify(
      {
        signature,
        nonce: siweMessage.nonce,
        time: new Date().toISOString(),
      },
      {
        // This options will include error in result (if any)
        suppressExceptions: true,
      },
    );

    // Handle verification errors (if any)
    if (result.error || !result.success) {
      throw new ForbiddenException(
        "Invalid signature. Please try to sign-in again",
      );
    }

    // Delete nonce when the signature have been verified
    const deleted = await this.deleteNonce(siweMessage.nonce);
    if (!deleted) {
      // This error can be safely ignored
      console.warn(`Failed to delete nonce: ${siweMessage.nonce}`);
    }

    // Accept signature. Issue new access token for account
    const accessToken = this.generateAccessToken(siweMessage.address);
    return accessToken;
  }

  async verifySiweMessage(message: SiweMessage): Promise<boolean> {
    // Check if the nonce is issued by the server
    const nonce = message.nonce;
    const isNonceIssuedByServer = await this.isNonceIssued(nonce);
    if (!isNonceIssuedByServer) {
      return false;
    }

    // Reject message if missing issuedAt
    if (message.issuedAt == null) {
      return false;
    }

    // Reject message if missing expirationTime
    if (message.expirationTime == null) {
      return false;
    }

    // Reject message if TTL is longer than expected
    const iss = new Date(message.issuedAt);
    const exp = new Date(message.expirationTime);
    const maxTTL = this.configService.get("messageMaxTTL");
    if (exp.getTime() - iss.getTime() > maxTTL) {
      return false;
    }

    return true;
  }

  generateAccessToken(walletAddress: string): string {
    const payload = {
      address: walletAddress,
    };

    const token = sign(payload, this.configService.get("jwtSecretKey"), {
      issuer: "Truth Memes Galactica",
      audience: "Truth Memes Galactica UI",
      expiresIn: "1d",
      notBefore: 0,
    });

    return token;
  }

  /**
   *
   * @param {string} nonce Nonce that need to be checked
   * @returns {boolean} Whether the input nonce is issued by the server
   */
  async isNonceIssued(nonce: string): Promise<boolean> {
    const databaseNonce = await this.prismaService.nonce.findFirst({
      where: { id: nonce },
    });

    if (!databaseNonce) {
      return false;
    }

    return true;
  }

  async storeNonce(nonce: string): Promise<boolean> {
    try {
      // Store nonce to database
      await this.prismaService.nonce.create({ data: { id: nonce } });
    } catch (error) {
      // When storing nonce, there is also a small chance for it to generate a duplicate nonce
      // Prisma will throw an error when that it try to add duplicate nonce into the DB
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          // Database error: Nonce existed
          console.error(error.message);
          return false;
        }

        console.error(error.message);
        throw new InternalServerErrorException("Cannot generate nonce");
      }
    }
  }

  /**
   *
   * @param {string} nonce The nonce you want to delete
   * @returns {boolean} Whether the delete operation is successful or not
   */
  async deleteNonce(nonce: string): Promise<boolean> {
    try {
      await this.prismaService.nonce.delete({
        where: {
          id: nonce,
        },
      });

      return true;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        // Operation failed on not found entry
        if (error.code === "P2025") {
          console.error(error.message);
        }
      }

      return false;
    }
  }
}
