import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { MemeModule } from "./meme/meme.module";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import configuration from "@root/config/configuration";

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      load: [configuration],
      isGlobal: true,
    }),
    MemeModule,
  ],
  providers: [AppService],
})
export class AppModule {}
