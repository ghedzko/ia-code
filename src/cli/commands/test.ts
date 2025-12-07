import * as p from "@clack/prompts";
import chalk from "chalk";
import { readFile, writeFile } from "node:fs/promises";
import { BaseProvider } from "../../providers/base.js";
import type { Message } from "../../providers/base.js";
import { TestGenerator } from "../../tests/generator.js";
import { TestImprover } from "../../tests/improver.js";
import { logger } from "../../utils/logger.js";
import { StreamWriter } from "../../utils/streaming.js";

export async function testCommand(
  provider: BaseProvider,
  filePath?: string,
  options: { improve?: boolean; output?: string } = {}
) {
  p.intro(chalk.blue("Test Generation"));

  try {
    if (options.improve && filePath) {
      // Improve existing tests
      const testContent = await readFile(filePath, "utf-8");
      const sourcePath = filePath.replace(/\.(test|spec)\.(ts|js|tsx|jsx)$/, ".$2");
      let sourceContent = "";
      try {
        sourceContent = await readFile(sourcePath, "utf-8");
      } catch {
        // Source file not found, continue without it
      }

      const improver = new TestImprover();
      const spinner = p.spinner();
      spinner.start("Improving tests...");

      const improved = await improver.improve(provider, testContent, sourceContent);
      spinner.stop();

      const outputPath = options.output || filePath.replace(/\.(test|spec)\./, ".improved.test.");
      await writeFile(outputPath, improved, "utf-8");
      p.log.success(chalk.green(`Improved tests written to ${outputPath}`));
    } else if (filePath) {
      // Generate tests for a file
      const content = await readFile(filePath, "utf-8");
      const generator = new TestGenerator();
      const spinner = p.spinner();
      spinner.start("Generating tests...");

      const tests = await generator.generate(provider, filePath, content);
      spinner.stop();

      const outputPath = options.output || filePath.replace(/\.(ts|js|tsx|jsx)$/, ".test.$1");
      await writeFile(outputPath, tests, "utf-8");
      p.log.success(chalk.green(`Tests written to ${outputPath}`));
    } else {
      p.log.error(chalk.red("Please provide a file path"));
      process.exit(1);
    }
  } catch (error) {
    p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    logger.error("Test command error:", error);
    process.exit(1);
  }
}

