import type { BaseProvider } from "../providers/base.js";
import type { Message } from "../providers/base.js";

export interface ADR {
  number: number;
  title: string;
  status: string;
  context: string;
  decision: string;
  consequences: string;
}

export class ADRGenerator {
  async generate(
    provider: BaseProvider,
    decision: string,
    context: string
  ): Promise<string> {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert in Architecture Decision Records (ADRs). Generate well-structured ADRs following standard format.",
      },
      {
        role: "user",
        content: `Generate an ADR for:\n\nDecision: ${decision}\n\nContext: ${context}`,
      },
    ];

    const response = await provider.chat(messages);
    return response.content;
  }
}

