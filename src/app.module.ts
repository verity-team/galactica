import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { MemeModule } from "./meme/meme.module";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    PrismaModule,
    MemeModule,
    AuthModule,
  ],
  providers: [AppService],
})
export class AppModule {}
