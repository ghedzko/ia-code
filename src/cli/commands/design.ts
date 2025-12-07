import * as p from "@clack/prompts";
import chalk from "chalk";
import { readFile } from "node:fs/promises";
import { BaseProvider } from "../../providers/base.js";
import { DesignDiscussions } from "../../product/design.js";
import { logger } from "../../utils/logger.js";
import { StreamWriter } from "../../utils/streaming.js";

export async function designCommand(
  provider: BaseProvider,
  question?: string,
  options: { context?: string; file?: string } = {}
) {
  p.intro(chalk.blue("Design Discussion"));

  try {
    const discussions = new DesignDiscussions();

    let designQuestion = question;
    if (!designQuestion) {
      designQuestion = await p.text({
        message: "What design question would you like to discuss?",
        placeholder: "e.g., How should we structure the authentication system?",
      });

      if (typeof designQuestion !== "string" || !designQuestion.trim()) {
        p.log.error(chalk.red("Design question is required"));
        process.exit(1);
      }
    }

    let context = options.context;
    if (options.file) {
      try {
        context = await readFile(options.file, "utf-8");
      } catch {
        p.log.warn(chalk.yellow(`Could not read file: ${options.file}`));
      }
    }

    const spinner = p.spinner();
    spinner.start("Discussing design...");

    const streamWriter = new StreamWriter((chunk) => {
      if (!chunk.done) {
        process.stdout.write(chunk.content);
      } else {
        process.stdout.write("\n");
      }
    });

    const discussion = await discussions.discuss(provider, designQuestion, context);
    spinner.stop();

    p.log.step(chalk.blue("Design Discussion:"));
    console.log(discussion);

    p.log.success(chalk.green("Design discussion complete"));
  } catch (error) {
    p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    logger.error("Design error:", error);
    process.exit(1);
  }
}

