import {
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  InternalServerErrorException,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { MemeService } from "./meme.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadMemeDTO } from "./meme.types";
import { EmptyResponse } from "src/utils/types/EmptyResponse";

@Controller("meme")
export class MemeController {
  constructor(private readonly memeService: MemeService) {}

  @Post()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor("fileName"))
  async uploadMeme(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: Number(process.env.MAX_MEME_SIZE) ?? 20000,
          }),
          new FileTypeValidator({ fileType: /\/(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
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
