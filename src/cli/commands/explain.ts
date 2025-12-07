import * as p from "@clack/prompts";
import chalk from "chalk";
import { readFile } from "node:fs/promises";
import { BaseProvider } from "../../providers/base.js";
import type { Message } from "../../providers/base.js";
import { logger } from "../../utils/logger.js";
import { StreamWriter } from "../../utils/streaming.js";

export async function explainCommand(provider: BaseProvider, filePath: string) {
  p.intro(chalk.blue("Explaining code..."));

  try {
    const content = await readFile(filePath, "utf-8");
    const fileName = filePath.split("/").pop() || filePath;

    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert code reviewer. Explain code clearly and concisely, covering what it does, how it works, and any important patterns or concepts.",
      },
      {
        role: "user",
        content: `Please explain the following code from ${fileName}:\n\n\`\`\`\n${content}\n\`\`\``,
      },
    ];

    const spinner = p.spinner();
    spinner.start("Analyzing code...");

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

    p.log.success(chalk.green("Explanation complete"));
  } catch (error) {
    p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    logger.error("Explain error:", error);
    process.exit(1);
  }
}

