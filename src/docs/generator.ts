import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";

export class DocumentationGenerator {
  async generate(
    provider: BaseProvider,
    projectContext: string
  ): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert technical writer. Generate comprehensive, clear documentation including usage examples, API references, and best practices.",
      },
      {
        role: "user",
        content: `Generate documentation for the following project:\n\n${projectContext}`,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

