import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";

export class TestImprover {
  async improve(
    provider: BaseProvider,
    testContent: string,
    sourceContent: string
  ): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert test reviewer. Improve existing tests by adding better coverage, edge cases, and clarity.",
      },
      {
        role: "user",
        content: `Improve the following tests:\n\nTests:\n\`\`\`\n${testContent}\n\`\`\`\n\nSource code:\n\`\`\`\n${sourceContent}\n\`\`\``,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

