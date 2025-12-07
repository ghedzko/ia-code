import * as p from "@clack/prompts";
import chalk from "chalk";
import { BaseProvider } from "../../providers/base.js";
import type { Message } from "../../providers/base.js";
import { logger } from "../../utils/logger.js";
import { StreamWriter } from "../../utils/streaming.js";

export async function chatCommand(provider: BaseProvider) {
  p.intro(chalk.blue("IA Code Chat"));
  p.note("Type 'exit' or 'quit' to end the conversation");

  const messages: Message[] = [];
  let conversationActive = true;

  while (conversationActive) {
    const input = await p.text({
      message: "You:",
      placeholder: "Enter your message...",
    });

    if (typeof input !== "string" || input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
      conversationActive = false;
      break;
    }

    if (!input.trim()) {
      continue;
    }

    messages.push({ role: "user", content: input });

    p.log.step("Thinking...");

    try {
      const streamWriter = new StreamWriter((chunk) => {
        if (!chunk.done) {
          process.stdout.write(chunk.content);
        }
      });

      await provider.streamChat(messages, (chunk) => {
        if (!chunk.done) {
          streamWriter.write(chunk.content);
        } else {
          streamWriter.end();
          process.stdout.write("\n");
        }
      });

      // Get the full response for the message history
      const response = await provider.chat(messages);
      messages.push({ role: "assistant", content: response.content });
    } catch (error) {
      p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      logger.error("Chat error:", error);
    }
  }

  p.outro(chalk.green("Goodbye!"));
}

