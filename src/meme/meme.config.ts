import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFileOptions,
} from "@nestjs/common";

export const getMemeUploadOptions = (): ParseFileOptions => {
  let maxSize = Number(process.env.MAX_IMG_SIZE);
  if (isNaN(maxSize)) {
    // Default max image size to 2MB
    maxSize = 2000000;
  }

  // Default to support JPG, JPEG, PNG and GIF
  const validFileType = new RegExp(
    `\/(${process.env.ALLOW_IMG_TYPE ?? "jpg|jpeg|png|gif"})$`,
  );

  return {
    validators: [
      new MaxFileSizeValidator({ maxSize }),
      new FileTypeValidator({ fileType: validFileType }),
    ],
  };
};
