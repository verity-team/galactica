import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { MemeModule } from "./meme/meme.module";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./prisma/prisma.module";
import { DevModule } from "./dev/dev.module";
import { ThrottlerModule } from "@nestjs/throttler";
import { getConfigModuleConfig, getThrottlerModuleConfig } from "./app.config";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot(getConfigModuleConfig()),
    ThrottlerModule.forRoot(getThrottlerModuleConfig()),
    CacheModule.register({ isGlobal: true }),
    PrismaModule,
    MemeModule,
    AuthModule,
    DevModule,
  ],
  providers: [AppService],
})
export class AppModule {}
