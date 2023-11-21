import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EmptyResponse } from "./utils/types/EmptyResponse";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe("Hello World!");
    });
  });

  describe("live status", () => {
    it("should return an Empty Response", () => {
      expect(appController.getLiveStatus()).toBeInstanceOf<EmptyResponse>(
        Object,
      );
    });
  });

  describe("ready status", () => {
    it("should return an Empty Response", () => {
      expect(appController.getReadyStatus()).toBeInstanceOf<EmptyResponse>(
        Object,
      );
    });
  });
});
