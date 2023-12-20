import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { MemeService } from "./meme.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UpdateMemeStatusDTO, UploadMemeDTO } from "./meme.types";
import { EmptyResponse } from "src/utils/types/EmptyResponse";
import { getMemeUploadOptions } from "./meme.config";
import { AuthGuard } from "@/auth/guards/auth.guard";
import { AddressThrottleGuard } from "@/auth/guards/address.guard";
import { Throttle } from "@nestjs/throttler";
import { DAY_MS } from "@/utils/time";
import { MemeUpload, MemeUploadStatus } from "@prisma/client";
import { PaginationResponse } from "@/utils/types/request.type";
import { RoleGuard } from "@/auth/guards/role.guard";
import { Roles } from "@/auth/decorators/role.decorator";

@Controller("meme")
export class MemeController {
  constructor(private readonly memeService: MemeService) {}

  @Post()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor("fileName"))
  @UseGuards(AuthGuard, AddressThrottleGuard, RoleGuard)
  @Throttle({ default: { limit: 12, ttl: DAY_MS } })
  @Roles(["user"])
  async uploadMeme(
    @UploadedFile(new ParseFilePipe(getMemeUploadOptions()))
    fileName: Express.Multer.File,
    @Body() body: UploadMemeDTO,
  ): Promise<EmptyResponse> {
    await this.memeService.uploadMeme(body, fileName);
    return {};
  }

  @Get("latest")
  @HttpCode(200)
  @UseInterceptors(ParseIntPipe)
  async getMeme(
    @Query("offset", ParseIntPipe) offset: number,
    @Query("limit", ParseIntPipe) limit: number,
    @Query("status") status?: MemeUploadStatus,
  ): Promise<PaginationResponse<MemeUpload>> {
    return await this.memeService.getMeme({ limit, offset }, { status });
  }

  @Get("image/:id")
  async getMemeImage(@Param("id") fileId: string) {
    const fileStream = await this.memeService.getMemeImage(fileId);
    return new StreamableFile(fileStream);
  }

  @Patch(":id/status")
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(["admin"])
  async updateMemeStatus(
    @Param("id") memeId: string,
    @Body() { status }: UpdateMemeStatusDTO,
  ) {
    await this.memeService.updateMemeStatus(memeId, status);
  }
}
