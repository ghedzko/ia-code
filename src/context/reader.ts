import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, extname } from "node:path";
import type { Config } from "../config/schema.js";

export interface FileContext {
  path: string;
  content: string;
  relativePath: string;
}

export class ContextReader {
  private config: Config;
  private ignorePatterns: string[];

  constructor(config: Config) {
    this.config = config;
    this.ignorePatterns = config.context?.ignorePatterns || [
      "node_modules",
      ".git",
      "dist",
      "build",
    ];
  }

  async readFile(filePath: string): Promise<FileContext> {
    const content = await readFile(filePath, "utf-8");
    return {
      path: filePath,
      content,
      relativePath: filePath,
    };
  }

  async readProject(projectPath: string = "."): Promise<FileContext[]> {
    const files: FileContext[] = [];
    const maxFiles = this.config.context?.maxFiles || 50;

    await this.readDirectory(projectPath, projectPath, files, maxFiles);

    return files;
  }

  private async readDirectory(
    dirPath: string,
    basePath: string,
    files: FileContext[],
    maxFiles: number
  ): Promise<void> {
    if (files.length >= maxFiles) {
      return;
    }

    try {
      const entries = await readdir(dirPath);

      for (const entry of entries) {
        if (files.length >= maxFiles) {
          break;
        }

        const fullPath = join(dirPath, entry);
        const relativePath = relative(basePath, fullPath);

        // Check if should ignore
        if (this.shouldIgnore(relativePath)) {
          continue;
        }

        try {
          const stats = await stat(fullPath);

          if (stats.isDirectory()) {
            await this.readDirectory(fullPath, basePath, files, maxFiles);
          } else if (stats.isFile() && this.isCodeFile(entry)) {
            try {
              const content = await readFile(fullPath, "utf-8");
              files.push({
                path: fullPath,
                content,
                relativePath,
              });
            } catch (error) {
              // Skip files that can't be read
              continue;
            }
          }
        } catch {
          // Skip entries that can't be accessed
          continue;
        }
      }
    } catch {
      // Skip directories that can't be read
    }
  }

  private shouldIgnore(path: string): boolean {
    return this.ignorePatterns.some((pattern) => path.includes(pattern));
  }

  private isCodeFile(filename: string): boolean {
    const codeExtensions = [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".py",
      ".java",
      ".go",
      ".rs",
      ".cpp",
      ".c",
      ".h",
      ".hpp",
      ".cs",
      ".php",
      ".rb",
      ".swift",
      ".kt",
      ".scala",
      ".clj",
      ".sh",
      ".bash",
      ".zsh",
      ".fish",
      ".json",
      ".yaml",
      ".yml",
      ".toml",
      ".md",
      ".txt",
    ];

    return codeExtensions.includes(extname(filename).toLowerCase());
  }
}

