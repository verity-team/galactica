import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EmptyResponse } from "./utils/types/EmptyResponse";
import { ServiceUnavailableException } from "@nestjs/common";

describe("AppController", () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    appService = new AppService();
    appController = new AppController(appService);
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
    it("should return an Empty Response", () => {
      expect(appController.getReadyStatus()).toBeInstanceOf<EmptyResponse>(
        Object,
      );
    });

    it("should throw Service Unavailable exception", () => {
      jest.spyOn(appService, "getReadyStatus").mockImplementation(() => false);

      expect(() => appController.getReadyStatus()).toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
