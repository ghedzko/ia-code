import { exec } from "node:child_process";
import { promisify } from "node:util";
import { logger } from "../utils/logger.js";

const execAsync = promisify(exec);

export class CommandRunner {
  async run(command: string, cwd: string = process.cwd()): Promise<{ stdout: string; stderr: string }> {
    logger.debug(`Running command: ${command} in ${cwd}`);
    try {
      const { stdout, stderr } = await execAsync(command, { cwd });
      return { stdout, stderr };
    } catch (error) {
      logger.error("Command execution error:", error);
      throw error;
    }
  }
}

