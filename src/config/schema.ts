export interface Config {
  default?: {
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  execpolicy?: {
    allowed?: string[];
    blocked?: string[];
  };
  context?: {
    maxFiles?: number;
    ignorePatterns?: string[];
  };
  memory?: {
    enabled?: boolean;
    storagePath?: string;
  };
  mcp?: {
    enabled?: boolean;
    servers?: Record<string, unknown>;
  };
}

export const defaultConfig: Config = {
  default: {
    provider: "deepseek",
    model: "deepseek-chat",
    temperature: 0.7,
    maxTokens: 4096,
  },
  execpolicy: {
    allowed: ["bun", "npm", "git", "test"],
    blocked: ["rm", "sudo", "format"],
  },
  context: {
    maxFiles: 50,
    ignorePatterns: ["node_modules", ".git", "dist", "build", ".next"],
  },
  memory: {
    enabled: true,
    storagePath: "~/.ia-code/memory",
  },
  mcp: {
    enabled: false,
  },
};

