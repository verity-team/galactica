import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaModule } from "@/prisma/prisma.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import configuration from "@root/config/configuration";

import * as siwe from "siwe";
import { eth } from "web3";
import { randomBytes } from "crypto";
import { verify } from "jsonwebtoken";
import { Maybe } from "@/utils/types/util.type";
import { DAY_MS } from "@/utils/time";

// Re-exporting siwe module
// This is required to spyOn functions import from an index file
jest.mock("siwe", () => ({
  __esModule: true,
  ...jest.requireActual("siwe"),
}));

function createSiweMessage(
  address: string,
  issuedAt?: Maybe<string>,
  expirationTime?: Maybe<string>,
): siwe.SiweMessage {
  const message = new siwe.SiweMessage({
    domain: "localhost",
    uri: "http://localhost/auth/verify",
    address,
    nonce: siwe.generateNonce(),
    issuedAt,
    expirationTime,
    version: "1",
    chainId: 1,
  });
  return message;
}

function createKeypair(): { publicKey: string; privateKey: string } {
  const privateKey = `0x${randomBytes(32).toString("hex")}`;
  const publicKey = eth.accounts.privateKeyToAddress(privateKey);
  return { publicKey, privateKey };
}

describe("AuthService", () => {
  let service: AuthService;
  let config: ConfigService;

  beforeEach(async () => {
    process.env = {
      JWT_SECRET_KEY: "SUPER_SECRET_KEY",
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
      imports: [
        PrismaModule,
        ConfigModule.forRoot({
          envFilePath: ".env",
          isGlobal: true,
          load: [configuration],
        }),
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    config = module.get<ConfigService>(ConfigService);

    jest.resetAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // getNonce()
  it("should return a nonce with 8+ characters", async () => {
    // Assumed that database operation is always successfull
    jest
      .spyOn(service, "storeNonce")
      .mockImplementation(async () => Promise.resolve(true));

    const { nonce, issuedAt, expirationTime } = await service.getNonce();

    expect(nonce).toBeDefined();
    expect(issuedAt).toBeDefined();
    expect(expirationTime).toBeDefined();

    expect(nonce.length).toBeGreaterThanOrEqual(8);
  });

  it("should throw error if generateNonce() keep throwing error", async () => {
    // Assumed that database operation is always successfull
    jest
      .spyOn(service, "storeNonce")
      .mockImplementation(async () => Promise.resolve(true));

    jest.spyOn(siwe, "generateNonce").mockImplementation(() => {
      throw new Error();
    });

    expect.assertions(1);
    try {
      await service.getNonce();
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
    }
  });

  it("should throw error if storeNonce() keep throwing error", async () => {
    // Immitate cannot store to database error
    jest
      .spyOn(service, "storeNonce")
      .mockImplementation(async () => Promise.resolve(false));

    expect.assertions(1);
    try {
      await service.getNonce();
    } catch (error) {
      expect(error).toBeInstanceOf(InternalServerErrorException);
    }
  });

  // verifySignature()
  it("should return an access token for valid signature", async () => {
    // Mock database operations
    jest
      .spyOn(service, "isNonceIssued")
      .mockImplementation(() => Promise.resolve(true));
    jest
      .spyOn(service, "deleteNonce")
      .mockImplementation(() => Promise.resolve(true));

    const now = new Date();
    const tomorrow = new Date(now.getTime() + DAY_MS);

    const { publicKey, privateKey } = createKeypair();

    const message = createSiweMessage(
      publicKey,
      now.toISOString(),
      tomorrow.toISOString(),
    );

    const { signature } = eth.accounts.sign(
      message.prepareMessage(),
      privateKey,
    );

    const accessToken = await service.verifySignature({
      message: message.prepareMessage(),
      signature,
    });
    expect(accessToken).toBeDefined();

    const isTokenValid = verify(accessToken, config.get("jwtSecretKey"));
    expect(isTokenValid).toBeDefined();
  });

  it("should throw Forbidden for invalid message", async () => {
    // Mock database operations
    jest
      .spyOn(service, "isNonceIssued")
      .mockImplementation(() => Promise.resolve(true));
    jest
      .spyOn(service, "deleteNonce")
      .mockImplementation(() => Promise.resolve(true));

    jest
      .spyOn(service, "verifySiweMessage")
      .mockImplementation(() => Promise.resolve(false));

    const now = new Date();
    const tomorrow = new Date(now.getTime() + DAY_MS);

    const { publicKey, privateKey } = createKeypair();

    const message = createSiweMessage(
      publicKey,
      now.toISOString(),
      tomorrow.toISOString(),
    );

    const { signature } = eth.accounts.sign(
      message.prepareMessage(),
      privateKey,
    );

    expect.assertions(1);
    try {
      await service.verifySignature({
        message: message.prepareMessage(),
        signature,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
  });

  // verifySiweMessage()
  it("should reject non-issuedAt message", async () => {
    // Mock database operations
    jest
      .spyOn(service, "isNonceIssued")
      .mockImplementation(() => Promise.resolve(true));
    jest
      .spyOn(service, "deleteNonce")
      .mockImplementation(() => Promise.resolve(true));

    const now = new Date();
    const tomorrow = new Date(now.getTime() + DAY_MS);

    const { publicKey } = createKeypair();

    const message = createSiweMessage(
      publicKey,
      undefined,
      tomorrow.toISOString(),
    );

    const isMessageValid = await service.verifySiweMessage(message);
    expect(isMessageValid).toBe(false);
  });

  it("should reject non-expirationTime message", async () => {
    // Mock database operations
    jest
      .spyOn(service, "isNonceIssued")
      .mockImplementation(() => Promise.resolve(true));
    jest
      .spyOn(service, "deleteNonce")
      .mockImplementation(() => Promise.resolve(true));

    const now = new Date();

    const { publicKey } = createKeypair();

    const message = createSiweMessage(publicKey, now.toISOString(), undefined);

    const isMessageValid = await service.verifySiweMessage(message);
    expect(isMessageValid).toBe(false);
  });

  it("should reject too-long-TTL message", async () => {
    // Mock database operations
    jest
      .spyOn(service, "isNonceIssued")
      .mockImplementation(() => Promise.resolve(true));
    jest
      .spyOn(service, "deleteNonce")
      .mockImplementation(() => Promise.resolve(true));

    const now = new Date();
    const tomorrow = new Date(now.getTime() + DAY_MS + 1);

    const { publicKey } = createKeypair();

    const message = createSiweMessage(
      publicKey,
      now.toISOString(),
      tomorrow.toISOString(),
    );

    const isMessageValid = await service.verifySiweMessage(message);
    expect(isMessageValid).toBe(false);
  });
});
