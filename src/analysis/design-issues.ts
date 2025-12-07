import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";
import type { FileContext } from "../context/reader.js";

export class DesignIssueDetector {
  async detect(
    provider: BaseProvider,
    files: FileContext[]
  ): Promise<string> {
    const architecture = files
      .map((f) => f.relativePath)
      .join("\n");

    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert software architect. Identify design issues, anti-patterns, coupling problems, and architectural concerns.",
      },
      {
        role: "user",
        content: `Analyze the following codebase structure for design issues:\n\n${architecture}`,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

