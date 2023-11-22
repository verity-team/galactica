import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFileOptions,
} from "@nestjs/common";

export const memeUploadOptions: ParseFileOptions = {
  validators: [
    new MaxFileSizeValidator({
      maxSize: Number(process.env.MAX_MEME_SIZE) ?? 20000,
    }),
    new FileTypeValidator({ fileType: /\/(jpg|jpeg|png|gif)$/ }),
  ],
};
