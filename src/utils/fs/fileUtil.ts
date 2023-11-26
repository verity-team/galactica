import { access, stat, writeFile } from "fs/promises";
import { extension } from "mime";
import { v4 as uuidv4 } from "uuid";

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
  if (fileId == null) {
    fileId = uuidv4();
  }

  // Check if destination exist
  try {
    await access(destination);
  } catch (error) {
    console.warn("Path not exist. Abort current operation");
    return false;
  }

  const fileExtension = extension(file.mimetype);
  const filePath = `${destination}/${fileId}.${fileExtension}`;

  // Check if file exist
  try {
    const fileStat = await stat(filePath);
    if (fileStat) {
      console.warn("File existed. Abort current operation");
      return false;
    }
  } catch {
    // Ignore error because it's okay if the file is non-existent
  }

  try {
    await writeFile(filePath, file.buffer);
  } catch (error) {
    console.warn("Error while writing file", error.message);
    return false;
  }

  return true;
}
