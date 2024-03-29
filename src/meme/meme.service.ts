import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { MemeFilter, UploadMemeDTO } from "./meme.types";
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
import { createHash } from "crypto";
import { LoggerService } from "@/logger/logger.service";

@Injectable()
export class MemeService {
  private readonly logger = new LoggerService(MemeService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly config: ConfigService,
  ) {}

  public async uploadMeme(
    memeInfo: UploadMemeDTO,
    meme: Express.Multer.File,
  ): Promise<boolean> {
    try {
      this.validateMemeInfo(memeInfo);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new BadRequestException(error.message);
    }

    const fileHash = this.createHashFromFile(meme);
    const foundMeme = await this.prismaService.memeUpload.findFirst({
      where: {
        userId: memeInfo.userId.toLowerCase(),
        fileHash,
      },
    });
    if (foundMeme != null) {
      this.logger.log("FAILED: User trying to upload the same meme twice");
      throw new ConflictException("Cannot upload the same meme twice");
    }

    // Save image into file system
    const destination = this.config.get<string>("imageDestination");
    const fileName = await saveFile(meme, destination);
    if (fileName == null) {
      this.logger.error("Failed to save meme into file system", "");
      throw new InternalServerErrorException(
        "Failed to upload meme. Please try again later",
      );
    }

    try {
      // Add meme information to the database
      await this.saveMemeInfo(memeInfo, {
        fileId: fileName,
        fileHash,
      });
    } catch (error) {
      // Rollback image in fs
      await removeFile(fileName, destination);

      // Error while creating db entry. Check logs to debug
      this.logger.error(
        "Cannot save meme's metadata into database",
        error.stack,
      );
      throw new InternalServerErrorException(
        "Failed to upload meme. Please try again later",
      );
    }

    return true;
  }

  public async isDuplicateMeme(
    userId: string,
    file: Express.Multer.File,
  ): Promise<boolean> {
    const fileHash = this.createHashFromFile(file);

    const foundImage = await this.prismaService.memeUpload.findMany({
      where: { userId, fileHash },
    });
    if (foundImage) {
      return true;
    }

    return false;
  }

  public async getMeme(
    { offset, limit }: PaginationRequestDTO,
    filter?: MemeFilter,
  ): Promise<PaginationResponse<MemeUpload>> {
    const count = await this.prismaService.memeUpload.count({
      where: {
        status: filter?.status ?? "APPROVED",
      },
    });
    const memes = await this.prismaService.memeUpload.findMany({
      where: {
        status: filter?.status ?? "APPROVED",
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
        total: count,
      },
    };
  }

  public async getSingleMeme(id: string): Promise<MemeUpload> {
    try {
      const foundMeme = await this.prismaService.memeUpload.findFirst({
        where: { fileId: id, status: "APPROVED" },
      });
      if (foundMeme == null) {
        throw new NotFoundException("Meme not existed");
      }
      return foundMeme;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.error("Prisma error:", JSON.stringify(error, null, 2));
        throw new InternalServerErrorException("Database unavailable");
      }

      this.logger.error("Unknown error", JSON.stringify(error, null, 2));
      throw error;
    }
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

  public async updateMemeStatus(
    id: string,
    status: MemeUploadStatus,
  ): Promise<boolean> {
    try {
      await this.prismaService.memeUpload.update({
        where: {
          fileId: id,
        },
        data: {
          status,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.error("Prisma error:", JSON.stringify(error, null, 2));
        return false;
      }

      this.logger.error("Unknown database error", error);
      return false;
    }

    // Return success even if there are no update to the target object
    return true;
  }

  validateMemeInfo(memeInfo: UploadMemeDTO): boolean {
    const { userId, tags } = memeInfo;

    // userId must be a Ethereum wallet address
    if (!isAddress(userId)) {
      throw new Error("Invalid userId. Not a wallet address.");
    }

    // In case where there is only one tag, form data return tags as a string, not a string array
    const isTagsArray = Array.isArray(memeInfo.tags);
    const isTagsString = typeof tags === "string" || tags instanceof String;
    if (!isTagsArray && isTagsString) {
      // Format tags to always be a string array (in case it's a string)
      memeInfo.tags = [memeInfo.tags as unknown as string];
    } else {
      return false;
    }

    return true;
  }

  async saveMemeInfo(
    memeInfo: UploadMemeDTO,
    { fileId, fileHash }: { fileId: string; fileHash: string },
  ): Promise<boolean> {
    try {
      await this.prismaService.memeUpload.create({
        data: {
          ...memeInfo,
          fileId,
          fileHash,
          userId: memeInfo.userId.toLowerCase(),
          status: MemeUploadStatus.PENDING,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.error(error.message, error.stack);
        throw new BadRequestException(
          "Failed to save meme due to database error",
        );
      }

      this.logger.error(error.message, error.stack);
      throw new InternalServerErrorException(
        "Unknown error occur when saving meme",
      );
    }

    return true;
  }

  createHashFromFile(file: Express.Multer.File) {
    const hasher = createHash("SHA256");
    hasher.update(file.buffer);
    return hasher.digest("hex");
  }
}
