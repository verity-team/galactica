import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { UploadMemeDTO } from "./meme.types";
import { isAddress } from "viem";
import { PrismaService } from "@/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { saveFile } from "@/utils/fs/fileUtil";

@Injectable()
export class MemeService {
  constructor(private readonly prismaService: PrismaService) {}

  async uploadMeme(
    memeInfo: UploadMemeDTO,
    meme: Express.Multer.File,
  ): Promise<boolean> {
    try {
      this.verifyMemeInfo(memeInfo);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    // Save image into file system
    const fileId = await saveFile(meme, "/app/images");
    if (fileId == null) {
      // Error while writing files to the system. Check logs to debug
      throw new InternalServerErrorException();
    }

    // Add uploadInfo into db, along with reference to fs image
    await this.saveMemeInfo(memeInfo, fileId);

    return true;
  }

  verifyMemeInfo(memeInfo: UploadMemeDTO): boolean {
    const { userId } = memeInfo;

    if (!isAddress(userId)) {
      throw new Error("Invalid userId. Not a wallet address.");
    }

    return true;
  }

  async saveMemeInfo(
    memeInfo: UploadMemeDTO,
    fileId: string,
  ): Promise<boolean> {
    try {
      await this.prismaService.memeUpload.create({
        data: { fileId, ...memeInfo },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // TODO: Change to use a logger with better context
        console.error(error.message);
        throw new BadRequestException(
          "Failed to save meme due to database error",
        );
      }

      throw new InternalServerErrorException(
        "Unknown error occur when saving meme",
      );
    }

    return true;
  }
}
