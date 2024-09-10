import { access, writeFile } from "fs/promises";

export async function ensureFileExists(filePath: string) {
    try {
      // Check if the file exists
      await access(filePath);
    } catch (error) {
      // If it doesn't exist, create an empty file
      await writeFile(filePath, '');
    }
  }
  