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
        console.error(`Prisma Client cannot be init. Error ${error.message}`);
        return;
      }

      console.error(`Unknown error. ${error.message}`);
    }
  }
}
