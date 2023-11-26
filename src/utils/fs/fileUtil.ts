import { access, stat, unlink, writeFile } from "fs/promises";
import * as mime from "mime";
import { v4 as uuidv4 } from "uuid";
import { Maybe } from "../types/util.type";

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
): Promise<Maybe<string>> {
  if (fileId == null) {
    fileId = uuidv4();
  }

  // Check if destination exist
  try {
    await access(destination);
  } catch (error) {
    console.warn("Path not exist. Abort current operation");
    return null;
  }

  const fileExtension = mime.extension(file.mimetype);
  const filePath = `${destination}/${fileId}.${fileExtension}`;

  // Check if file exist
  try {
    const fileStat = await stat(filePath);
    if (fileStat) {
      console.warn("File existed. Abort current operation", filePath);
      return null;
    }
  } catch {
    // Ignore error because it's okay if the file is non-existent
  }

  try {
    await writeFile(filePath, file.buffer);
  } catch (error) {
    console.warn("Error while writing file", error.message);
    return null;
  }

  return `${fileId}.${fileExtension}`;
}

export async function removeFile(
  fileName: string,
  destination: string,
): Promise<Maybe<string>> {
  // Check if destination exist
  try {
    await access(destination);
  } catch (error) {
    console.warn("Path not exist. Abort current operation");
    return null;
  }

  // Check if file exist
  const filePath = `${destination}/${fileName}`;
  try {
    await stat(filePath);
  } catch {
    return null;
  }

  // Delete targeted file
  try {
    await unlink(filePath);
  } catch (error) {
    console.warn("Cannot delete file", filePath, "with error", error);
    return null;
  }

  return fileName;
}
