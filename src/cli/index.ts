#!/usr/bin/env bun

import { createCLI } from "./parser.js";
import { chatCommand } from "./commands/chat.js";
import { generateCommand } from "./commands/generate.js";
import { explainCommand } from "./commands/explain.js";
import { refactorCommand } from "./commands/refactor.js";
import { execCommand, CommandExecutor } from "./commands/exec.js";
import { ConfigLoader } from "../config/loader.js";
import { DeepSeekProvider } from "../providers/deepseek.js";
import { GrokProvider } from "../providers/grok.js";
import { OpenAIProvider } from "../providers/openai.js";
import { AnthropicProvider } from "../providers/anthropic.js";
import { GoogleProvider } from "../providers/google.js";
import type { BaseProvider } from "../providers/base.js";
import { logger } from "../utils/logger.js";
import * as p from "@clack/prompts";
import chalk from "chalk";

function createProvider(config: ConfigLoader): BaseProvider {
  const providerName = config.getConfig().default?.provider || "deepseek";
  const providerConfig = config.getProviderConfig(providerName);

  switch (providerName.toLowerCase()) {
    case "deepseek":
      return new DeepSeekProvider(providerConfig);
    case "grok":
      return new GrokProvider(providerConfig);
    case "openai":
      return new OpenAIProvider(providerConfig);
    case "anthropic":
      return new AnthropicProvider(providerConfig);
    case "google":
      return new GoogleProvider(providerConfig);
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}

async function main() {
  const program = createCLI();
  const configLoader = new ConfigLoader();
  const config = await configLoader.load();

  // Chat command
  program
    .command("chat")
    .description("Start interactive chat session")
    .action(async () => {
      try {
        const provider = createProvider(configLoader);
        await chatCommand(provider);
      } catch (error) {
        p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  // Generate command
  program
    .command("generate")
    .description("Generate code from a prompt")
    .argument("<prompt>", "Code generation prompt")
    .option("-o, --output <file>", "Output file path")
    .action(async (prompt: string, options: { output?: string }) => {
      try {
        const provider = createProvider(configLoader);
        await generateCommand(provider, prompt, options.output);
      } catch (error) {
        p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  // Explain command
  program
    .command("explain")
    .description("Explain code in a file")
    .argument("<file>", "File path to explain")
    .action(async (file: string) => {
      try {
        const provider = createProvider(configLoader);
        await explainCommand(provider, file);
      } catch (error) {
        p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  // Refactor command
  program
    .command("refactor")
    .description("Refactor code in a file")
    .argument("<file>", "File path to refactor")
    .argument("<instructions>", "Refactoring instructions")
    .action(async (file: string, instructions: string) => {
      try {
        const provider = createProvider(configLoader);
        await refactorCommand(provider, file, instructions);
      } catch (error) {
        p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  // Exec command
  program
    .command("exec")
    .description("Execute a system command (with policy checks)")
    .argument("<command>", "Command to execute")
    .action(async (command: string) => {
      try {
        const executor = new CommandExecutor(config);
        await execCommand(executor, command);
      } catch (error) {
        p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  // Init command
  program
    .command("init")
    .description("Initialize configuration")
    .action(async () => {
      p.intro(chalk.blue("Initializing IA Code configuration..."));
      const configLoader = new ConfigLoader();
      await configLoader.load();
      p.log.success(chalk.green("Configuration initialized at ~/.ia-code/config.toml"));
    });

  program.parse();
}

main().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});

