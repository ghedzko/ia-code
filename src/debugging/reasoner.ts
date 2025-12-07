import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";

export class DebugReasoner {
  async reason(
    provider: BaseProvider,
    error: string,
    context: string
  ): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert debugger. Provide step-by-step reasoning about errors, explaining what went wrong and why, with clear guidance on how to fix it.",
      },
      {
        role: "user",
        content: `Reason about this error:\n\nError: ${error}\n\nContext:\n\`\`\`\n${context}\n\`\`\``,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

