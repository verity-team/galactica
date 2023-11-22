import {
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { MemeService } from "./meme.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadMemeDTO } from "./meme.types";
import { EmptyResponse } from "src/utils/types/EmptyResponse";
import { memeUploadOptions } from "./meme.config";

@Controller("meme")
export class MemeController {
  constructor(private readonly memeService: MemeService) {}

  @Post()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor("fileName"))
  async uploadMeme(
    @UploadedFile(new ParseFilePipe(memeUploadOptions))
    fileName: Express.Multer.File,
    @Body() body: UploadMemeDTO,
  ): Promise<EmptyResponse> {
    const uploaded = await this.memeService.uploadMeme(body, fileName);
    if (!uploaded) {
      throw new InternalServerErrorException();
    }

    return {};
  }
}
