import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";

export class RequirementsAnalyzer {
  async analyze(
    provider: BaseProvider,
    requirements: string
  ): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert product analyst. Analyze requirements, identify ambiguities, suggest improvements, and discuss implementation approaches before writing code.",
      },
      {
        role: "user",
        content: `Analyze and discuss these requirements:\n\n${requirements}`,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

