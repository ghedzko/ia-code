#!/usr/bin/env bun

import { createCLI } from "./parser.js";
import { chatCommand } from "./commands/chat.js";
import { generateCommand } from "./commands/generate.js";
import { explainCommand } from "./commands/explain.js";
import { refactorCommand } from "./commands/refactor.js";
import { execCommand, CommandExecutor } from "./commands/exec.js";
import { testCommand } from "./commands/test.js";
import { analyzeCommand } from "./commands/analyze.js";
import { autofixCommand } from "./commands/autofix.js";
import { debugCommand } from "./commands/debug.js";
import { docsCommand } from "./commands/docs.js";
import { designCommand } from "./commands/design.js";
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

  // Test command
  program
    .command("test")
    .description("Generate or improve tests")
    .argument("[file]", "File path to generate tests for")
    .option("-i, --improve", "Improve existing tests")
    .option("-o, --output <file>", "Output file path")
    .action(async (file: string | undefined, options: { improve?: boolean; output?: string }) => {
      try {
        const provider = createProvider(configLoader);
        await testCommand(provider, file, options);
      } catch (error) {
        p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  // Analyze command
  program
    .command("analyze")
    .description("Analyze project architecture")
    .argument("[path]", "Project path to analyze", ".")
    .action(async (path: string) => {
      try {
        const provider = createProvider(configLoader);
        await analyzeCommand(provider, path);
      } catch (error) {
        p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  // Autofix command
  program
    .command("autofix")
    .description("Automatically fix code errors")
    .argument("<file>", "File path to fix")
    .option("-e, --error <error>", "Error message or description")
    .action(async (file: string, options: { error?: string }) => {
      try {
        const provider = createProvider(configLoader);
        await autofixCommand(provider, file, options.error);
      } catch (error) {
        p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  // Debug command
  program
    .command("debug")
    .description("Debug errors with step-by-step reasoning")
    .argument("<stacktrace>", "Stacktrace or error message")
    .option("-l, --logs <logs>", "Additional logs")
    .option("-f, --file <file>", "Source file for context")
    .action(async (stacktrace: string, options: { logs?: string; file?: string }) => {
      try {
        const provider = createProvider(configLoader);
        await debugCommand(provider, stacktrace, options);
      } catch (error) {
        p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  // Docs command
  program
    .command("docs")
    .description("Generate documentation")
    .argument("[path]", "Project path", ".")
    .option("-o, --output <file>", "Output file path", "README.md")
    .option("-t, --type <type>", "Documentation type (readme|api|adr)", "readme")
    .action(async (path: string, options: { output?: string; type?: string }) => {
      try {
        const provider = createProvider(configLoader);
        const type = options.type as "readme" | "api" | "adr" | undefined;
        await docsCommand(provider, path, { ...options, type });
      } catch (error) {
        p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  // Design command
  program
    .command("design")
    .description("Discuss design and architecture")
    .argument("[question]", "Design question")
    .option("-c, --context <context>", "Additional context")
    .option("-f, --file <file>", "File to use as context")
    .action(async (question: string | undefined, options: { context?: string; file?: string }) => {
      try {
        const provider = createProvider(configLoader);
        await designCommand(provider, question, options);
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
