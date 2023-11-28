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

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getNonce(): Promise<string> {
    let retry = 3;
    let nonce = "";

    // When using generateNonce(), there is a small chance for it to generate a less-then-8-char nonce
    // It will throw error when that "small chance" occur

    // When storing nonce, there is also a small chance for it to generate a duplicate nonce
    // Prisma will throw error when that "small chance" occur
    while (retry > 0) {
      try {
        nonce = generateNonce();

        // Store nonce to database
        await this.prismaService.nonce.create({ data: { id: nonce } });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          // Database error
          if (error.code === "P2002") {
            // Nonce existed => Retry
            retry--;
            continue;
          }

          console.error("Cannot store nonce into database", error.message);
          throw new InternalServerErrorException("Cannot generate nonce");
        }

        // Generate nonce error => Retry
        retry--;
        continue;
      }

      if (nonce !== "") {
        return nonce;
      }
    }

    throw new InternalServerErrorException("Cannot generate nonce");
  }

  async verifySignature({
    message,
    signature,
  }: VerifySignatureDTO): Promise<boolean> {
    const siweMessage = new SiweMessage(message);

    const isMessageValid = await this.verifySiweMessage(siweMessage);
    if (!isMessageValid) {
      throw new ForbiddenException(
        "Invalid signature. Please try to sign-in again",
      );
    }

    // We can use the message nonce after we have verified it
    const result = await siweMessage.verify({
      signature,
      nonce: siweMessage.nonce,
      time: new Date().toISOString(),
    });
    return result.success;
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
          console.warn(error.message);
        }
      }

      return false;
    }
  }
}
