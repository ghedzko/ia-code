import { FileModifier } from "./modifier.js";
import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";

export class SingleFileRefactor {
  private modifier = new FileModifier();

  async refactor(
    provider: BaseProvider,
    filePath: string,
    instructions: string
  ): Promise<string> {
    const content = await this.modifier.readFile(filePath);

    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert code refactoring assistant. Refactor code to improve quality, maintainability, and performance while preserving functionality. Always provide the complete refactored code.",
      },
      {
        role: "user",
        content: `Refactor the following code:\n\nInstructions: ${instructions}\n\nOriginal code:\n\n\`\`\`\n${content}\n\`\`\`\n\nPlease provide the refactored code.`,
      },
    ];

    const response = await provider.chat(messages);
    let refactoredCode = response.content;

    // Extract code from markdown code blocks if present
    const codeBlockMatch = refactoredCode.match(/```[\w]*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      refactoredCode = codeBlockMatch[1];
    }

    return refactoredCode;
  }
}

