import { execSync } from "node:child_process";
import { logger } from "../utils/logger.js";

export interface GitStatus {
  isRepo: boolean;
  branch?: string;
  hasChanges: boolean;
  modifiedFiles: string[];
  untrackedFiles: string[];
}

export class GitIntegration {
  isGitRepo(path: string = "."): boolean {
    try {
      execSync("git rev-parse --git-dir", {
        cwd: path,
        stdio: "ignore",
      });
      return true;
    } catch {
      return false;
    }
  }

  getStatus(path: string = "."): GitStatus {
    if (!this.isGitRepo(path)) {
      return {
        isRepo: false,
        hasChanges: false,
        modifiedFiles: [],
        untrackedFiles: [],
      };
    }

    try {
      const branch = execSync("git branch --show-current", {
        cwd: path,
        encoding: "utf-8",
      }).trim();

      const statusOutput = execSync("git status --porcelain", {
        cwd: path,
        encoding: "utf-8",
      });

      const modifiedFiles: string[] = [];
      const untrackedFiles: string[] = [];

      for (const line of statusOutput.split("\n")) {
        if (!line.trim()) continue;

        const status = line.substring(0, 2);
        const file = line.substring(3);

        if (status.startsWith("??")) {
          untrackedFiles.push(file);
        } else if (status !== "  ") {
          modifiedFiles.push(file);
        }
      }

      return {
        isRepo: true,
        branch,
        hasChanges: modifiedFiles.length > 0 || untrackedFiles.length > 0,
        modifiedFiles,
        untrackedFiles,
      };
    } catch (error) {
      logger.warn("Error getting git status:", error);
      return {
        isRepo: true,
        hasChanges: false,
        modifiedFiles: [],
        untrackedFiles: [],
      };
    }
  }

  getDiff(path: string = "."): string {
    if (!this.isGitRepo(path)) {
      return "";
    }

    try {
      return execSync("git diff", {
        cwd: path,
        encoding: "utf-8",
      });
    } catch {
      return "";
    }
  }
}

