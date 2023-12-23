import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  getLiveStatus(): boolean {
    return true;
  }

  async getReadyStatus(): Promise<boolean> {
    // TODO: Check APIs' dependencies on database
    // TODO: Check APIs' dependencies on 3rd-party APIs (if any)
    const isDatabaseReady = await this.getDatabaseReadyStatus();

    if (!isDatabaseReady) {
      return false;
    }

    return true;
  }

  private async getDatabaseReadyStatus(): Promise<boolean> {
    try {
      const result = await this.prismaService.$queryRaw`SELECT 1`;
      if (!result) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}
