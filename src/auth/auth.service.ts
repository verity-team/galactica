import { Injectable } from "@nestjs/common";
import { VerifySignatureDTO } from "./types/VerifySignature";
import { SiweMessage, generateNonce } from "siwe";

@Injectable()
export class AuthService {
  constructor() {}

  getNonce(): string {
    return generateNonce();
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
