import {
  UnauthorizedException,
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import {
  AccessTokenPayload,
  VerifySignatureDTO,
} from "./types/VerifySignature";
import { SiweMessage, generateNonce } from "siwe";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PrismaService } from "@/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { decode, sign } from "jsonwebtoken";
import { prettyPrintError } from "@/utils/logging";
import { DAY_MS } from "@/utils/time";
import { GetNonceResponse } from "./types/GetNonce";
import { SignInWithCredentialsDTO } from "./types/SignInWithCredentials";
import { createHmac } from "crypto";
import { isString } from "class-validator";

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

      const issuedAt = new Date();
      const expirationTime = new Date(issuedAt.getTime() + DAY_MS);

      // Try to store nonce into database
      const saved = await this.storeNonce(nonce, expirationTime);
      if (!saved) {
        retry--;
        continue;
      }

      if (nonce !== "") {
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
  public verifyUserAccessToken(accessToken: string, address: string): boolean {
    const payload = decode(accessToken, { json: true });

    const tokenAddress = payload["address"];
    if (tokenAddress == null) {
      return false;
    }

    if (address.toLowerCase() !== tokenAddress.toLowerCase()) {
      return false;
    }

    return true;
  }

  public async verifyAdminAccessToken(accessToken: string): Promise<boolean> {
    const payload = decode(accessToken, { json: true });

    const address = payload["address"];
    if (address == null || !isString(address)) {
      return false;
    }

    // Remove 0x prefix
    const hexUsername = address.slice(2);
    const username = Buffer.from(hexUsername, "hex").toString("utf8");

    try {
      await this.prismaService.admin.findFirstOrThrow({
        where: {
          username,
        },
      });
    } catch (error) {
      this.logger.error(JSON.stringify(error, null, 2));
      return false;
    }

    return true;
  }

  public async signInWithCredentials(
    credentials: SignInWithCredentialsDTO,
  ): Promise<string> {
    const { username, password } = credentials;

    try {
      const foundAdmin = await this.prismaService.admin.findFirstOrThrow({
        where: { username },
      });

      const secret = this.configService.get("jwtSecretKey");
      const hashPassword = createHmac("sha256", secret)
        .update(password)
        .digest("hex");

      if (hashPassword !== foundAdmin.password) {
        throw new Error();
      }

      const accessToken = this.generateAdminAccessToken(username);
      return accessToken;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          this.logger.error("Cannot find admin with username", username);
        }
      }

      this.logger.error("Unexpected error", JSON.stringify(error, null, 2));
      throw new UnauthorizedException("Invalid credentials");
    }
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
    const payload: AccessTokenPayload = {
      address: walletAddress,
      role: "user",
    };

    const secret = this.configService.get("jwtSecretKey");
    const token = sign(payload, secret, {
      expiresIn: "1d",
    });

    return token;
  }

  generateAdminAccessToken(username: string): string {
    const hexUsername = Buffer.from(username).toString("hex");
    const payload: AccessTokenPayload = {
      address: `0x${hexUsername}`,
      role: "admin",
    };

    const secret = this.configService.get("jwtSecretKey");
    const token = sign(payload, secret, {
      issuer: "Truth Memes Galactica",
      audience: "Truth Memes Galactica UI",
      expiresIn: "12h",
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

  async storeNonce(nonce: string, expirationTime: Date): Promise<boolean> {
    try {
      // Store nonce to database
      await this.prismaService.nonce.create({
        data: { id: nonce, expirationTime },
      });
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
