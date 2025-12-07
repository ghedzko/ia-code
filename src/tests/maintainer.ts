import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";

export class TestMaintainer {
  async maintain(
    provider: BaseProvider,
    testContent: string,
    updatedSourceContent: string
  ): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert test maintainer. Update tests to match changes in source code while maintaining test quality and coverage.",
      },
      {
        role: "user",
        content: `Update the following tests to match the new source code:\n\nTests:\n\`\`\`\n${testContent}\n\`\`\`\n\nUpdated source code:\n\`\`\`\n${updatedSourceContent}\n\`\`\``,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

