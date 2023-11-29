import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaModule } from "@/prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { InternalServerErrorException } from "@nestjs/common";

import * as siwe from "siwe";

// Re-exporting siwe module
// This is required to spyOn functions import from an index file
jest.mock("siwe", () => ({
  __esModule: true,
  ...jest.requireActual("siwe"),
}));

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
      imports: [PrismaModule, ConfigModule],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.resetAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // Get nonce
  it("should return a nonce with 8+ characters", async () => {
    // Assumed that database operation is always successfull
    jest
      .spyOn(service, "storeNonce")
      .mockImplementation(async () => Promise.resolve(true));

    const nonce = await service.getNonce();

    expect(nonce).toBeDefined();
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
});
