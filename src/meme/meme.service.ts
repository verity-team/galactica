import { Injectable } from "@nestjs/common";
import { UploadMemeDTO } from "./meme.types";

@Injectable()
export class MemeService {
  async uploadMeme(
    memeInfo: UploadMemeDTO,
    meme: Express.Multer.File,
  ): Promise<boolean> {
    console.log(memeInfo);
    console.log(meme.size);

    return true;
  }
}
