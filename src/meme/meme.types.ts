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
