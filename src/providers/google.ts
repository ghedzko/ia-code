import { BaseProvider, type Message, type ProviderConfig, type ProviderResponse } from "./base.js";
import type { StreamHandler } from "../utils/streaming.js";

export class GoogleProvider extends BaseProvider {
  private baseURL = "https://generativelanguage.googleapis.com/v1beta";

  constructor(config: ProviderConfig) {
    super(config);
    if (config.baseURL) {
      this.baseURL = config.baseURL;
    }
  }

  getName(): string {
    return "google";
  }

  getDefaultModel(): string {
    return this.config.model || "gemini-pro";
  }

  private convertMessages(messages: Message[]) {
    // Google Gemini API tiene un formato diferente
    const systemMessages = messages.filter((m) => m.role === "system");
    const conversationMessages = messages.filter((m) => m.role !== "system");

    return {
      systemInstruction: systemMessages.map((m) => m.content).join("\n") || undefined,
      contents: conversationMessages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })),
    };
  }

  async chat(messages: Message[]): Promise<ProviderResponse> {
    const { systemInstruction, contents } = this.convertMessages(messages);
    const model = this.getDefaultModel();

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: this.config.temperature ?? 0.7,
        maxOutputTokens: this.config.maxTokens,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const url = `${this.baseURL}/models/${model}:generateContent?key=${this.config.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount,
            completionTokens: data.usageMetadata.candidatesTokenCount,
            totalTokens: data.usageMetadata.totalTokenCount,
          }
        : undefined,
    };
  }

  async streamChat(messages: Message[], onChunk: StreamHandler): Promise<void> {
    const { systemInstruction, contents } = this.convertMessages(messages);
    const model = this.getDefaultModel();

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: this.config.temperature ?? 0.7,
        maxOutputTokens: this.config.maxTokens,
      },
    };

    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const url = `${this.baseURL}/models/${model}:streamGenerateContent?key=${this.config.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google API error: ${response.status} - ${error}`);
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
          if (line.trim()) {
            try {
              const json = JSON.parse(line);
              const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                onChunk({ content: text, done: false });
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        try {
          const json = JSON.parse(buffer);
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            onChunk({ content: text, done: false });
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      onChunk({ content: "", done: true });
    } finally {
      reader.releaseLock();
    }
  }
}

