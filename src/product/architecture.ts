import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";

export class ArchitectureDiscussions {
  async discuss(
    provider: BaseProvider,
    architectureQuestion: string,
    currentArchitecture?: string
  ): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert software architect. Discuss architectural decisions, patterns, scalability, and system design before implementation.",
      },
      {
        role: "user",
        content: `Discuss this architecture question:\n\n${architectureQuestion}${currentArchitecture ? `\n\nCurrent architecture:\n\`\`\`\n${currentArchitecture}\n\`\`\`` : ""}`,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

