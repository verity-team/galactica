import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFileOptions,
} from "@nestjs/common";

export const getMemeUploadOptions = (): ParseFileOptions => {
  let maxSize = Number(process.env.MAX_MEME_SIZE);
  if (isNaN(maxSize)) {
    // Default max image size to 20kB
    maxSize = 20000;
  }

  const validFileType = /\/(jpg|jpeg|png|gif)$/;

  return {
    validators: [
      new MaxFileSizeValidator({ maxSize }),
      new FileTypeValidator({ fileType: validFileType }),
    ],
  };
};
