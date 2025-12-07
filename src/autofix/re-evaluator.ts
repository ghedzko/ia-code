import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";

export class FixReevaluator {
  async reevaluate(
    provider: BaseProvider,
    originalError: string,
    fixedCode: string
  ): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert code reviewer. Re-evaluate fixed code to ensure the fix is correct and doesn't introduce new issues.",
      },
      {
        role: "user",
        content: `Re-evaluate this fix:\n\nOriginal error: ${originalError}\n\nFixed code:\n\`\`\`\n${fixedCode}\n\`\`\``,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

