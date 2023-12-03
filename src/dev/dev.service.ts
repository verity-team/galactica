import { DAY_MS } from "@/utils/time";
import { Injectable } from "@nestjs/common";
import { SiweMessage } from "siwe";
import { GetSiweMessageDTO } from "./dev.type";

@Injectable()
export class DevService {
  public getSiweMessage(messageInput: GetSiweMessageDTO): string {
    const { address, nonce } = messageInput;

    const now = new Date();
    const tomorrow = new Date(now.getTime() + DAY_MS);

    const message = new SiweMessage({
      domain: "localhost",
      uri: "http://localhost/auth",
      address,
      nonce,
      issuedAt: now.toISOString(),
      expirationTime: tomorrow.toISOString(),
      version: "1",
      chainId: 1,
    });

    return message.prepareMessage();
  }
}
