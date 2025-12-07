import * as p from "@clack/prompts";
import chalk from "chalk";
import { readFile, writeFile } from "node:fs/promises";
import { BaseProvider } from "../../providers/base.js";
import type { Message } from "../../providers/base.js";
import { logger } from "../../utils/logger.js";

export async function refactorCommand(
  provider: BaseProvider,
  filePath: string,
  instructions: string
) {
  p.intro(chalk.blue("Refactoring code..."));

  try {
    const content = await readFile(filePath, "utf-8");
    const fileName = filePath.split("/").pop() || filePath;

    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert code refactoring assistant. Refactor code to improve quality, maintainability, and performance while preserving functionality. Always provide the complete refactored code.",
      },
      {
        role: "user",
        content: `Refactor the following code from ${fileName}:\n\nInstructions: ${instructions}\n\nOriginal code:\n\n\`\`\`\n${content}\n\`\`\`\n\nPlease provide the refactored code.`,
      },
    ];

    const spinner = p.spinner();
    spinner.start("Refactoring...");

    const response = await provider.chat(messages);
    spinner.stop();

    // Extract code from markdown code blocks if present
    let refactoredCode = response.content;
    const codeBlockMatch = refactoredCode.match(/```[\w]*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      refactoredCode = codeBlockMatch[1];
    }

    // Ask for confirmation
    const shouldApply = await p.confirm({
      message: `Apply refactoring to ${fileName}?`,
      initialValue: true,
    });

    if (shouldApply) {
      await writeFile(filePath, refactoredCode, "utf-8");
      p.log.success(chalk.green(`Refactored code written to ${filePath}`));
    } else {
      p.log.info("Refactoring cancelled");
      console.log("\nRefactored code:\n");
      console.log(refactoredCode);
    }
  } catch (error) {
    p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    logger.error("Refactor error:", error);
    process.exit(1);
  }
}

