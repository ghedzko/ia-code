import { BaseProvider, type Message, type ProviderConfig, type ProviderResponse } from "./base.js";
import type { StreamHandler } from "../utils/streaming.js";

export class AnthropicProvider extends BaseProvider {
  private baseURL = "https://api.anthropic.com/v1";

  constructor(config: ProviderConfig) {
    super(config);
    if (config.baseURL) {
      this.baseURL = config.baseURL;
    }
  }

  getName(): string {
    return "anthropic";
  }

  getDefaultModel(): string {
    return this.config.model || "claude-3-5-sonnet-20241022";
  }

  private convertMessages(messages: Message[]) {
    // Anthropic API tiene un formato diferente
    const systemMessages = messages.filter((m) => m.role === "system");
    const conversationMessages = messages.filter((m) => m.role !== "system");

    return {
      system: systemMessages.map((m) => m.content).join("\n") || undefined,
      messages: conversationMessages.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      })),
    };
  }

  async chat(messages: Message[]): Promise<ProviderResponse> {
    const { system, messages: convertedMessages } = this.convertMessages(messages);

    const body: Record<string, unknown> = {
      model: this.getDefaultModel(),
      messages: convertedMessages,
      temperature: this.config.temperature ?? 0.7,
      max_tokens: this.config.maxTokens ?? 4096,
    };

    if (system) {
      body.system = system;
    }

    const response = await fetch(`${this.baseURL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.content[0]?.text || "",
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
    };
  }

  async streamChat(messages: Message[], onChunk: StreamHandler): Promise<void> {
    const { system, messages: convertedMessages } = this.convertMessages(messages);

    const body: Record<string, unknown> = {
      model: this.getDefaultModel(),
      messages: convertedMessages,
      temperature: this.config.temperature ?? 0.7,
      max_tokens: this.config.maxTokens ?? 4096,
      stream: true,
    };

    if (system) {
      body.system = system;
    }

    const response = await fetch(`${this.baseURL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    if (!response.body) {
      throw new Error("No response body for streaming");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              onChunk({ content: "", done: true });
              return;
            }

            try {
              const json = JSON.parse(data);
              if (json.type === "content_block_delta" && json.delta?.text) {
                onChunk({ content: json.delta.text, done: false });
              } else if (json.type === "message_stop") {
                onChunk({ content: "", done: true });
                return;
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      onChunk({ content: "", done: true });
    } finally {
      reader.releaseLock();
    }
  }
}

