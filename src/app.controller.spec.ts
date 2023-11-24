import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaService } from "./prisma/prisma.service";
import { EmptyResponse } from "./utils/types/EmptyResponse";
import { ServiceUnavailableException } from "@nestjs/common";

describe("AppController", () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const prismaService = new PrismaService();
    appService = new AppService(prismaService);
    appController = new AppController(appService);

    jest.clearAllMocks();
  });

  describe("live status", () => {
    it("should return an Empty Response", () => {
      expect(appController.getLiveStatus()).toBeInstanceOf<EmptyResponse>(
        Object,
      );
    });

    it("should throw Service Unavailable exception", () => {
      jest.spyOn(appService, "getLiveStatus").mockImplementation(() => false);

      expect(() => appController.getLiveStatus()).toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe("ready status", () => {
    it("should return an Empty Response", async () => {
      jest
        .spyOn(appService, "getReadyStatus")
        .mockImplementation(() => Promise.resolve(true));

      const status = await appController.getReadyStatus();
      expect(status).toBeInstanceOf<EmptyResponse>(Object);
    });

    it("should throw Service Unavailable exception", async () => {
      jest
        .spyOn(appService, "getReadyStatus")
        .mockImplementation(() => Promise.resolve(false));

      try {
        await appController.getReadyStatus();
      } catch (error: any) {
        expect(error).toBeInstanceOf(ServiceUnavailableException);
      }
    });
  });
});
