import * as p from "@clack/prompts";
import chalk from "chalk";
import { readFile } from "node:fs/promises";
import { BaseProvider } from "../../providers/base.js";
import { DebugAnalyzer } from "../../debugging/analyzer.js";
import { DebugReasoner } from "../../debugging/reasoner.js";
import { logger } from "../../utils/logger.js";
import { StreamWriter } from "../../utils/streaming.js";

export async function debugCommand(
  provider: BaseProvider,
  stacktrace: string,
  options: { logs?: string; file?: string } = {}
) {
  p.intro(chalk.blue("Debugging Analysis"));

  try {
    const analyzer = new DebugAnalyzer();
    const reasoner = new DebugReasoner();

    let context = "";
    if (options.file) {
      try {
        context = await readFile(options.file, "utf-8");
      } catch {
        p.log.warn(chalk.yellow(`Could not read file: ${options.file}`));
      }
    }

    const spinner = p.spinner();
    spinner.start("Analyzing error...");

    // Analyze stacktrace
    const analysis = await analyzer.analyze(provider, stacktrace, options.logs);
    spinner.stop();

    p.log.step(chalk.blue("Analysis:"));
    console.log(analysis);
    console.log("\n");

    // Step-by-step reasoning
    if (context) {
      spinner.start("Generating step-by-step reasoning...");
      const reasoning = await reasoner.reason(provider, stacktrace, context);
      spinner.stop();

      p.log.step(chalk.blue("Step-by-step reasoning:"));
      console.log(reasoning);
    }

    p.log.success(chalk.green("Debugging analysis complete"));
  } catch (error) {
    p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    logger.error("Debug error:", error);
    process.exit(1);
  }
}

