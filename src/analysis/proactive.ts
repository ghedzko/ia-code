import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";
import type { FileContext } from "../context/reader.js";

export class ProactiveAnalyzer {
  async analyze(
    provider: BaseProvider,
    files: FileContext[]
  ): Promise<string> {
    const fileSummary = files
      .slice(0, 20)
      .map((f) => `${f.relativePath}: ${f.content.substring(0, 200)}...`)
      .join("\n");

    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert code reviewer. Analyze code proactively to identify potential issues, vulnerabilities, design problems, and areas for improvement without being explicitly asked.",
      },
      {
        role: "user",
        content: `Analyze the following codebase for potential issues:\n\n${fileSummary}`,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

