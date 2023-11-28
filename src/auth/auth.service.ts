import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { VerifySignatureDTO } from "./types/VerifySignature";
import { SiweMessage, generateNonce } from "siwe";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async getNonce(): Promise<string> {
    let retry = 5;
    let nonce = "";

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

    // TODO: Add time + nonce verification
    const result = await siweMessage.verify({ signature });
    return result.success;
  }
}
