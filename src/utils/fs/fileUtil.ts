/**
 *
 * @param file
 * @param destination
 * @param fileId Filename. Generate an UUIDv4 by default
 */
export async function saveFile(
  file: Express.Multer.File,
  destination: string,
  fileId?: string,
): Promise<boolean> {
  console.log(file);
  console.log(destination);
  console.log(fileId ?? "");

  return true;
}
