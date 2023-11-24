import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error: any) {
      if (error instanceof PrismaClientInitializationError) {
        console.warn("Prisma Client cannot be init. " + error.message);
        return;
      }

      console.log("Unknown error. " + JSON.stringify(error));
    }
  }
}
