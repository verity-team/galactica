import { Module } from "@nestjs/common";
import { MemeService } from "./meme.service";
import { MemeController } from "./meme.controller";

@Module({
  controllers: [MemeController],
  providers: [MemeService],
})
export class MemeModule {}
