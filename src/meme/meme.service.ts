import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { UploadMemeDTO } from "./meme.types";
import { isAddress } from "viem";
import { PrismaService } from "@/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { removeFile, saveFile } from "@/utils/fs/fileUtil";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MemeService {
  private readonly logger = new Logger(MemeService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly config: ConfigService,
  ) {}

  public async uploadMeme(
    memeInfo: UploadMemeDTO,
    meme: Express.Multer.File,
  ): Promise<boolean> {
    try {
      this.verifyMemeInfo(memeInfo);
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }

    // Save image into file system
    const destination = this.config.get<string>("imageDestination");
    const fileName = await saveFile(meme, destination);
    if (fileName == null) {
      // Error while writing files to the system. Check logs to debug
      throw new InternalServerErrorException(
        "Failed to upload meme. Please try again later",
      );
    }

    try {
      // Add uploadInfo into db, along with reference to fs image
      await this.saveMemeInfo(memeInfo, fileName);
    } catch {
      // Rollback image in fs
      await removeFile(fileName, destination);

      // Error while creating db entry. Check logs to debug
      throw new InternalServerErrorException(
        "Failed to upload meme. Please try again later",
      );
    }

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
        this.logger.error(error.message);
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
