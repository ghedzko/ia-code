import * as p from "@clack/prompts";
import chalk from "chalk";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { Config } from "../../config/schema.js";
import { logger } from "../../utils/logger.js";

const execAsync = promisify(exec);

export class CommandExecutor {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  private isAllowed(command: string): boolean {
    const execpolicy = this.config.execpolicy;
    if (!execpolicy) {
      return true; // Default: allow all if no policy
    }

    // Check blocked commands first
    if (execpolicy.blocked) {
      for (const blocked of execpolicy.blocked) {
        if (command.includes(blocked)) {
          return false;
        }
      }
    }

    // Check allowed commands
    if (execpolicy.allowed) {
      const commandBase = command.split(" ")[0];
      return execpolicy.allowed.some((allowed) => commandBase.includes(allowed));
    }

    return true; // Default: allow if no restrictions
  }

  async execute(command: string, cwd: string = process.cwd()): Promise<{ stdout: string; stderr: string }> {
    if (!this.isAllowed(command)) {
      throw new Error(`Command "${command}" is blocked by execpolicy`);
    }

    logger.debug(`Executing command: ${command} in ${cwd}`);

    try {
      const { stdout, stderr } = await execAsync(command, { cwd });
      return { stdout, stderr };
    } catch (error) {
      logger.error("Command execution error:", error);
      throw error;
    }
  }
}

export async function execCommand(executor: CommandExecutor, command: string) {
  p.intro(chalk.blue("Executing command..."));

  try {
    const spinner = p.spinner();
    spinner.start(`Running: ${command}`);

    const result = await executor.execute(command);

    spinner.stop();

    if (result.stdout) {
      console.log(result.stdout);
    }

    if (result.stderr) {
      console.error(chalk.yellow(result.stderr));
    }

    p.log.success(chalk.green("Command executed successfully"));
  } catch (error) {
    p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    logger.error("Exec error:", error);
    process.exit(1);
  }
}

