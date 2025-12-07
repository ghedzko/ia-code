import type { StreamHandler } from "../utils/streaming.js";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ProviderConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ProviderResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export abstract class BaseProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract chat(messages: Message[]): Promise<ProviderResponse>;
  abstract streamChat(
    messages: Message[],
    onChunk: StreamHandler
  ): Promise<void>;

  abstract getName(): string;
  abstract getDefaultModel(): string;
}

