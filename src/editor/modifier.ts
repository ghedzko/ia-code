import { readFile, writeFile } from "node:fs/promises";
import { logger } from "../utils/logger.js";

export interface FileModification {
  path: string;
  content: string;
  reason?: string;
}

export class FileModifier {
  async modifyFile(path: string, newContent: string): Promise<void> {
    try {
      await writeFile(path, newContent, "utf-8");
      logger.debug(`Modified file: ${path}`);
    } catch (error) {
      logger.error(`Error modifying file ${path}:`, error);
      throw error;
    }
  }

  async readFile(path: string): Promise<string> {
    try {
      return await readFile(path, "utf-8");
    } catch (error) {
      logger.error(`Error reading file ${path}:`, error);
      throw error;
    }
  }
}

