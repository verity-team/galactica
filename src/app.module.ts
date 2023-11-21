import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { MemeModule } from "./meme/meme.module";
import { AppService } from './app/app.service';

@Module({
  controllers: [AppController],
  imports: [MemeModule],
  providers: [AppService],
})
export class AppModule {}
