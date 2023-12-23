import { MemeUploadStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum } from "class-validator";

export class UploadMemeDTO {
  userId: string;

  // TODO: Introduce a type for lang
  lang: string;

  // TODO: Type for tags ?
  // TODO: Limit for tags
  tags: string[];

  // TODO: Limit for caption
  caption: string;
}

export class UpdateMemeStatusDTO {
  @Transform(({ value }) => ("" + value).toUpperCase())
  @IsEnum(MemeUploadStatus)
  status: MemeUploadStatus;
}

export interface MemeFilter {
  status?: MemeUploadStatus;
}
