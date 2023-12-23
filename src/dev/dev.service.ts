import { DAY_MS } from "@/utils/time";
import { BadRequestException, Injectable } from "@nestjs/common";
import { SiweMessage } from "siwe";
import { GetSiweMessageDTO } from "./dev.type";
import { SignInWithCredentialsDTO } from "@/auth/types/SignInWithCredentials";
import { PrismaService } from "@/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { createHmac } from "crypto";

@Injectable()
export class DevService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  public getSiweMessage(messageInput: GetSiweMessageDTO): string {
    const { address, nonce } = messageInput;

    const now = new Date();
    const tomorrow = new Date(now.getTime() + DAY_MS);

    const message = new SiweMessage({
      domain: "localhost",
      uri: "http://localhost/auth",
      statement: "Welcome to TruthMemes",
      address,
      nonce,
      issuedAt: now.toISOString(),
      expirationTime: tomorrow.toISOString(),
      version: "1",
      chainId: 1,
    });

    return message.prepareMessage();
  }

  public async signUpAdmin(
    credentials: SignInWithCredentialsDTO,
  ): Promise<boolean> {
    const { username, password } = credentials;

    const foundAdmin = await this.prismaService.admin.findFirst({
      where: {
        username,
      },
    });
    if (foundAdmin) {
      throw new BadRequestException("Username existed");
    }

    const secret = this.configService.get("jwtSecretKey");
    const hashPassword = createHmac("sha256", secret)
      .update(password)
      .digest("hex");
    await this.prismaService.admin.create({
      data: {
        username,
        password: hashPassword,
      },
    });

    return true;
  }
}
