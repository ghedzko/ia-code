import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";

export class AutofixEngine {
  async fix(
    provider: BaseProvider,
    error: string,
    code: string
  ): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert code fixer. Automatically fix errors in code while maintaining functionality and code quality.",
      },
      {
        role: "user",
        content: `Fix the following error in the code:\n\nError: ${error}\n\nCode:\n\`\`\`\n${code}\n\`\`\``,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

