import {
  Body,
  Controller,
  Get,
  HttpCode,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { MemeService } from "./meme.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { GetMemeDTO, UploadMemeDTO } from "./meme.types";
import { EmptyResponse } from "src/utils/types/EmptyResponse";
import { getMemeUploadOptions } from "./meme.config";
import { AuthGuard } from "@/auth/guards/auth.guard";
import { AddressThrottleGuard } from "@/auth/guards/address.guard";
import { Throttle } from "@nestjs/throttler";
import { DAY_MS } from "@/utils/time";
import { MemeUpload } from "@prisma/client";
import { PaginationResponse } from "@/utils/types/request.type";

@Controller("meme")
export class MemeController {
  constructor(private readonly memeService: MemeService) {}

  @Post()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor("fileName"))
  @UseGuards(AuthGuard, AddressThrottleGuard)
  @Throttle({ default: { limit: 12, ttl: DAY_MS } })
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
  @UseGuards(AuthGuard)
  async getMeme(
    @Query() pagination: GetMemeDTO,
  ): Promise<PaginationResponse<MemeUpload>> {
    return await this.memeService.getMeme(pagination);
  }
}
