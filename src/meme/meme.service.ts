import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { UploadMemeDTO } from "./meme.types";
import { isAddress } from "viem";
import { PrismaService } from "@/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { removeFile, saveFile } from "@/utils/fs/fileUtil";
import { ConfigService } from "@nestjs/config";
import {
  PaginationRequestDTO,
  PaginationResponse,
} from "@/utils/types/request.type";
import { MemeUpload, MemeUploadStatus } from "@prisma/client";
import { join } from "path";
import { stat } from "fs/promises";
import { createReadStream } from "fs";

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
      this.logger.error("Failed to save meme into file system");
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
      this.logger.error("Cannot save meme's metadata into database");
      throw new InternalServerErrorException(
        "Failed to upload meme. Please try again later",
      );
    }

    return true;
  }

  public async getMeme({
    offset,
    limit,
  }: PaginationRequestDTO): Promise<PaginationResponse<MemeUpload>> {
    const memes = await this.prismaService.memeUpload.findMany({
      where: {
        status: MemeUploadStatus.PENDING,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    return {
      data: memes,
      pagination: {
        offset,
        limit,
        total: memes.length,
      },
    };
  }

  public async getMemeImage(id: string) {
    const filePath = join(process.cwd(), "images", id);
    try {
      await stat(filePath);
    } catch (error) {
      // Format file system errors to HTTP errors
      if (error?.code === "ENOENT") {
        throw new NotFoundException("Meme image not found");
      }

      throw new InternalServerErrorException(
        "Unable to get meme image. Please try again later",
      );
    }

    return createReadStream(filePath);
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
      memeInfo.tags = [...memeInfo.tags];
      await this.prismaService.memeUpload.create({
        data: {
          ...memeInfo,
          fileId,
          userId: memeInfo.userId.toLowerCase(),
          status: MemeUploadStatus.PENDING,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.error(error.message);
        throw new BadRequestException(
          "Failed to save meme due to database error",
        );
      }

      this.logger.error(error.message);
      throw new InternalServerErrorException(
        "Unknown error occur when saving meme",
      );
    }

    return true;
  }
}
