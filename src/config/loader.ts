import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { parse as parseToml } from "toml";
import type { Config } from "./schema.js";
import { defaultConfig } from "./schema.js";
import { logger } from "../utils/logger.js";

const CONFIG_DIR = join(homedir(), ".ia-code");
const CONFIG_FILE = join(CONFIG_DIR, "config.toml");

export class ConfigLoader {
  private config: Config = defaultConfig;

  async load(): Promise<Config> {
    try {
      const content = await readFile(CONFIG_FILE, "utf-8");
      const parsed = parseToml(content) as Config;
      this.config = { ...defaultConfig, ...parsed };
      logger.debug("Config loaded from", CONFIG_FILE);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        logger.debug("Config file not found, using defaults");
        await this.createDefaultConfig();
      } else {
        logger.warn("Error loading config:", error);
      }
    }

    // Override with environment variables
    this.applyEnvOverrides();

    return this.config;
  }

  private applyEnvOverrides() {
    // Provider selection
    if (process.env.IA_PROVIDER) {
      this.config.default = this.config.default || {};
      this.config.default.provider = process.env.IA_PROVIDER;
    }

    // Model selection
    if (process.env.IA_MODEL) {
      this.config.default = this.config.default || {};
      this.config.default.model = process.env.IA_MODEL;
    }

    // Temperature
    if (process.env.IA_TEMPERATURE) {
      this.config.default = this.config.default || {};
      this.config.default.temperature = parseFloat(process.env.IA_TEMPERATURE);
    }

    // Max tokens
    if (process.env.IA_MAX_TOKENS) {
      this.config.default = this.config.default || {};
      this.config.default.maxTokens = parseInt(process.env.IA_MAX_TOKENS, 10);
    }
  }

  private async createDefaultConfig() {
    try {
      await mkdir(CONFIG_DIR, { recursive: true });
      const defaultToml = `[default]
provider = "deepseek"
model = "deepseek-chat"
temperature = 0.7
max_tokens = 4096

[execpolicy]
allowed = ["bun", "npm", "git", "test"]
blocked = ["rm", "sudo", "format"]

[context]
max_files = 50
ignore_patterns = ["node_modules", ".git", "dist", "build", ".next"]

[memory]
enabled = true
storage_path = "~/.ia-code/memory"

[mcp]
enabled = false
`;
      await writeFile(CONFIG_FILE, defaultToml, "utf-8");
      logger.info("Created default config at", CONFIG_FILE);
    } catch (error) {
      logger.warn("Could not create default config:", error);
    }
  }

  getConfig(): Config {
    return this.config;
  }

  getProviderConfig(providerName: string): {
    apiKey: string;
    baseURL?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } {
    const envKey = `IA_${providerName.toUpperCase()}_API_KEY`;
    const apiKey = process.env[envKey];

    if (!apiKey) {
      throw new Error(
        `API key not found for provider ${providerName}. Set ${envKey} environment variable.`
      );
    }

    return {
      apiKey,
      model: this.config.default?.model,
      temperature: this.config.default?.temperature,
      maxTokens: this.config.default?.maxTokens,
    };
  }
}

