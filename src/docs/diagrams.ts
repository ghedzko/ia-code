import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";

export class DiagramGenerator {
  async generate(
    provider: BaseProvider,
    architecture: string
  ): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert in software architecture diagrams. Generate diagrams in Mermaid format that clearly show system architecture, data flow, and component relationships.",
      },
      {
        role: "user",
        content: `Generate architecture diagrams for:\n\n${architecture}`,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

