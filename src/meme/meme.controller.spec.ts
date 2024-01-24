import { Test, TestingModule } from "@nestjs/testing";
import { MemeController } from "./meme.controller";
import { MemeService } from "./meme.service";
import { PrismaModule } from "@/prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { getThrottlerModuleConfig } from "@/app.config";
import { ThrottlerModule } from "@nestjs/throttler";
import { CACHE_MANAGER } from "@nestjs/cache-manager";

describe("MemeController", () => {
  let controller: MemeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemeController],
      providers: [MemeService, { provide: CACHE_MANAGER, useValue: {} }],
      imports: [
        PrismaModule,
        ConfigModule,
        ThrottlerModule.forRoot(getThrottlerModuleConfig()),
      ],
    }).compile();

    controller = module.get<MemeController>(MemeController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
