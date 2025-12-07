import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";

export class DebugAnalyzer {
  async analyze(
    provider: BaseProvider,
    stacktrace: string,
    logs?: string
  ): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert debugger. Analyze stacktraces and logs to identify root causes and provide step-by-step debugging guidance.",
      },
      {
        role: "user",
        content: `Analyze the following error:\n\nStacktrace:\n\`\`\`\n${stacktrace}\n\`\`\`${logs ? `\n\nLogs:\n\`\`\`\n${logs}\n\`\`\`` : ""}`,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

