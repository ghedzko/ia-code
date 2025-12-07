import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";

export class DesignDiscussions {
  async discuss(
    provider: BaseProvider,
    designQuestion: string,
    context?: string
  ): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert software designer. Discuss design decisions, trade-offs, patterns, and architectural choices before implementation.",
      },
      {
        role: "user",
        content: `Discuss this design question:\n\n${designQuestion}${context ? `\n\nContext:\n\`\`\`\n${context}\n\`\`\`` : ""}`,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

