import { Test, TestingModule } from "@nestjs/testing";
import { MemeService } from "./meme.service";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "@/prisma/prisma.module";

describe("MemeService", () => {
  let service: MemeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemeService],
      imports: [PrismaModule, ConfigModule],
    }).compile();

    service = module.get<MemeService>(MemeService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
