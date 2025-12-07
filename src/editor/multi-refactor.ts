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
    
    // Try to parse structured response
    // Look for file blocks in the format: FILE: path/to/file.ts
    const fileBlocks = response.content.split(/FILE:\s*([^\n]+)/);
    const result: MultiFileRefactorResult = { files: [] };

    if (fileBlocks.length > 1) {
      // Structured response with file markers
      for (let i = 1; i < fileBlocks.length; i += 2) {
        const filePath = fileBlocks[i].trim();
        const content = fileBlocks[i + 1]?.trim() || "";
        
        // Extract code from markdown if present
        let code = content;
        const codeBlockMatch = content.match(/```[\w]*\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
          code = codeBlockMatch[1];
        }

        // Find matching file
        const matchingFile = files.find((f) => 
          f.relativePath.includes(filePath) || filePath.includes(f.relativePath)
        );

        if (matchingFile) {
          result.files.push({
            path: matchingFile.path,
            content: code,
            reason: instructions,
          });
        }
      }
    } else {
      // Fallback: single response, apply to all files
      let code = response.content;
      const codeBlockMatch = code.match(/```[\w]*\n([\s\S]*?)\n```/);
      if (codeBlockMatch) {
        code = codeBlockMatch[1];
      }

      result.files = files.map((f) => ({
        path: f.path,
        content: code,
        reason: instructions,
      }));
    }

    return result;
  }
}

