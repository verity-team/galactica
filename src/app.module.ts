import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MemeModule } from "./meme/meme.module";

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [MemeModule],
})
export class AppModule {}
