import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";
import type { FileContext } from "../context/reader.js";

export class VulnerabilityDetector {
  async detect(
    provider: BaseProvider,
    files: FileContext[]
  ): Promise<string> {
    const codeSamples = files
      .slice(0, 10)
      .map((f) => `${f.relativePath}:\n\`\`\`\n${f.content}\n\`\`\``)
      .join("\n\n");

    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are a security expert. Identify security vulnerabilities, injection risks, authentication issues, and other security concerns in code.",
      },
      {
        role: "user",
        content: `Analyze the following code for security vulnerabilities:\n\n${codeSamples}`,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

