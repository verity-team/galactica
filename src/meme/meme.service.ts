import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UploadMemeDTO } from "./meme.types";
import { isAddress } from "viem";

@Injectable()
export class MemeService {
  async uploadMeme(
    memeInfo: UploadMemeDTO,
    meme: Express.Multer.File,
  ): Promise<boolean> {
    if (!isAddress(memeInfo.userId)) {
      throw new HttpException("Invalid userId", HttpStatus.BAD_REQUEST);
    }

    console.log(memeInfo);
    console.log(meme);

    return true;
  }
}
