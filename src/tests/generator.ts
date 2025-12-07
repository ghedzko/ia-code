import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";

export class TestGenerator {
  async generate(
    provider: BaseProvider,
    filePath: string,
    fileContent: string
  ): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert test writer. Generate comprehensive, well-structured tests following best practices. Include edge cases and error handling.",
      },
      {
        role: "user",
        content: `Generate tests for the following code:\n\nFile: ${filePath}\n\n\`\`\`\n${fileContent}\n\`\`\``,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

