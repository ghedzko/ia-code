import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";
import type { FileContext } from "../context/reader.js";

export interface MultiFileRefactorResult {
  files: Array<{
    path: string;
    content: string;
    reason: string;
  }>;
}

export class MultiFileRefactor {
  async refactor(
    provider: BaseProvider,
    files: FileContext[],
    instructions: string
  ): Promise<MultiFileRefactorResult> {
    const fileContents = files
      .map((f) => `${f.relativePath}:\n\`\`\`\n${f.content}\n\`\`\``)
      .join("\n\n");

    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert code refactoring assistant. Refactor multiple files with semantic coherence. Maintain consistency across all files. Provide refactored code for each file in a structured format.",
      },
      {
        role: "user",
        content: `Refactor the following files:\n\nInstructions: ${instructions}\n\nFiles:\n\n${fileContents}\n\nPlease provide the refactored code for each file, maintaining semantic coherence across all changes.`,
      },
    ];

    const response = await provider.chat(messages);
    // TODO: Parse structured response to extract individual file changes
    // For now, return a simple structure
    return {
      files: files.map((f) => ({
        path: f.path,
        content: response.content,
        reason: instructions,
      })),
    };
  }
}

