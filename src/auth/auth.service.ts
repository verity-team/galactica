import {
  UnauthorizedException,
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { VerifySignatureDTO } from "./types/VerifySignature";
import { SiweMessage, generateNonce } from "siwe";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PrismaService } from "@/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { decode, sign } from "jsonwebtoken";
import { Maybe } from "@/utils/types/util.type";
import { prettyPrintError } from "@/utils/logging";
import { DAY_MS } from "@/utils/time";
import { GetNonceResponse } from "./types/GetNonce";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  public async getNonce(): Promise<GetNonceResponse> {
    let nonce = "";

    for (let retry = 3; retry > 0; retry--) {
      try {
        // When using generateNonce(), there is a small chance for it to generate a less-then-8-char nonce
        // generateNonce() will throw an error when that "small chance" occur
        nonce = generateNonce();
      } catch (error) {
        retry--;
        continue;
      }

      // Try to store nonce into database
      const saved = await this.storeNonce(nonce);
      if (!saved) {
        retry--;
        continue;
      }

      if (nonce !== "") {
        const issuedAt = new Date();
        const expirationTime = new Date(issuedAt.getTime() + DAY_MS);

        return {
          nonce,
          issuedAt: issuedAt.toISOString(),
          expirationTime: expirationTime.toISOString(),
        };
      }
    }

    throw new InternalServerErrorException(
      "Cannot generate nonce. Please try again later",
    );
  }

  public async verifySignature({
    message,
    signature,
  }: VerifySignatureDTO): Promise<string> {
    let siweMessage: Maybe<SiweMessage> = null;
    try {
      siweMessage = new SiweMessage(message);
    } catch (error) {
      prettyPrintError(error);
      throw new BadRequestException("Invalid message");
    }

    if (!siweMessage) {
      throw new BadRequestException("Invalid message");
    }

    const isMessageValid = await this.verifySiweMessage(siweMessage);
    if (!isMessageValid) {
      throw new UnauthorizedException(
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
      throw new UnauthorizedException(
        "Invalid signature. Please try to sign-in again",
      );
    }

    // Delete nonce when the signature have been verified
    await this.deleteNonce(siweMessage.nonce);

    // Accept signature. Issue new access token for account
    const accessToken = this.generateAccessToken(siweMessage.address);
    return accessToken;
  }

  // Verifying access token validity using secret key and their exp will be done in AuthGuard
  // This function only verify whether the access token's address is the same as the requesting address
  public verifyAccessToken(accessToken: string, address: string): boolean {
    const payload = decode(accessToken, { json: true });

    const tokenAddress = payload["address"];
    if (tokenAddress == null) {
      return false;
    }

    if (tokenAddress !== address) {
      return false;
    }

    return true;
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
          this.logger.error(error.message);
          return false;
        }

        this.logger.error(error.message);
        return false;
      }
    }

    return true;
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
          this.logger.error(error.message);
        }
      }

      return false;
    }
  }
}
