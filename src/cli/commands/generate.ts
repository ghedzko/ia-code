import * as p from "@clack/prompts";
import chalk from "chalk";
import { BaseProvider } from "../../providers/base.js";
import type { Message } from "../../providers/base.js";
import { logger } from "../../utils/logger.js";
import { StreamWriter } from "../../utils/streaming.js";

export async function generateCommand(
  provider: BaseProvider,
  prompt: string,
  outputFile?: string
) {
  p.intro(chalk.blue("Generating code..."));

  const messages: Message[] = [
    {
      role: "system",
      content:
        "You are an expert software developer. Generate clean, well-structured code following best practices. Always provide complete, runnable code.",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  try {
    const spinner = p.spinner();
    spinner.start("Generating code...");

    const streamWriter = new StreamWriter((chunk) => {
      if (!chunk.done) {
        process.stdout.write(chunk.content);
      } else {
        process.stdout.write("\n");
      }
    });

    await provider.streamChat(messages, (chunk) => {
      spinner.stop();
      if (!chunk.done) {
        streamWriter.write(chunk.content);
      } else {
        streamWriter.end();
      }
    });

    const fullResponse = streamWriter.getBuffer();

    if (outputFile) {
      const { writeFile } = await import("node:fs/promises");
      await writeFile(outputFile, fullResponse, "utf-8");
      p.log.success(chalk.green(`Code written to ${outputFile}`));
    } else {
      p.log.success(chalk.green("Code generated successfully"));
    }
  } catch (error) {
    p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    logger.error("Generate error:", error);
    process.exit(1);
  }
}

