import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { MemeModule } from "./meme/meme.module";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    MemeModule,
  ],
  providers: [AppService],
})
export class AppModule {}
