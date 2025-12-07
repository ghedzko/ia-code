import { BaseProvider, type Message, type ProviderConfig, type ProviderResponse } from "./base.js";
import type { StreamHandler } from "../utils/streaming.js";
import { formatAPIError } from "./error-utils.js";

export class DeepSeekProvider extends BaseProvider {
  private baseURL = "https://api.deepseek.com/v1";

  constructor(config: ProviderConfig) {
    super(config);
    if (config.baseURL) {
      this.baseURL = config.baseURL;
    }
  }

  getName(): string {
    return "deepseek";
  }

  getDefaultModel(): string {
    return this.config.model || "deepseek-chat";
  }

  async chat(messages: Message[]): Promise<ProviderResponse> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.getDefaultModel(),
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(formatAPIError("DeepSeek", response.status, errorText));
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || "",
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }

  async streamChat(messages: Message[], onChunk: StreamHandler): Promise<void> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.getDefaultModel(),
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(formatAPIError("DeepSeek", response.status, errorText));
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
        const lines = buffer.split("\n\n");
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
              const content = json.choices[0]?.delta?.content || "";
              if (content) {
                onChunk({ content, done: false });
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data !== "[DONE]") {
              try {
                const json = JSON.parse(data);
                const content = json.choices[0]?.delta?.content || "";
                if (content) {
                  onChunk({ content, done: false });
                }
              } catch (e) {
                // Ignore parse errors
              }
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

