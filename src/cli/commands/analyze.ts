import * as p from "@clack/prompts";
import chalk from "chalk";
import { BaseProvider } from "../../providers/base.js";
import type { Message } from "../../providers/base.js";
import { ContextReader } from "../../context/reader.js";
import { ProjectAnalyzer } from "../../context/analyzer.js";
import { ArchitectureAnalyzer } from "../../context/architecture.js";
import { ConfigLoader } from "../../config/loader.js";
import { logger } from "../../utils/logger.js";
import { StreamWriter } from "../../utils/streaming.js";

export async function analyzeCommand(provider: BaseProvider, projectPath: string = ".") {
  p.intro(chalk.blue("Architecture Analysis"));

  try {
    const configLoader = new ConfigLoader();
    const config = await configLoader.load();
    const reader = new ContextReader(config);
    const projectAnalyzer = new ProjectAnalyzer();
    const architectureAnalyzer = new ArchitectureAnalyzer();

    const spinner = p.spinner();
    spinner.start("Reading project files...");

    const files = await reader.readProject(projectPath);
    spinner.stop();

    p.log.step(`Analyzed ${files.length} files`);

    spinner.start("Analyzing project structure...");
    const structure = projectAnalyzer.analyze(files);
    const architecture = architectureAnalyzer.analyze(structure);
    spinner.stop();

    // Generate detailed analysis with AI
    const analysisPrompt = `Analyze the following project structure:

Languages: ${structure.languages.join(", ")}
Entry Points: ${structure.entryPoints.join(", ")}
Dependencies: ${structure.dependencies.slice(0, 20).join(", ")}
Layers: ${architecture.layers.join(", ")}
Patterns: ${architecture.patterns.join(", ")}

Provide a comprehensive architectural analysis including:
1. Overall architecture pattern
2. Layer organization
3. Dependencies and relationships
4. Potential improvements
5. Design patterns used`;

    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are an expert software architect. Provide detailed architectural analysis of codebases, identifying patterns, layers, dependencies, and potential improvements.",
      },
      {
        role: "user",
        content: analysisPrompt,
      },
    ];

    spinner.start("Generating detailed analysis...");
    const streamWriter = new StreamWriter((chunk) => {
      if (!chunk.done) {
        process.stdout.write(chunk.content);
      } else {
        process.stdout.write("\n");
      }
    });

    await provider.streamChat(messages, (chunk) => {
      spinner.stop();
      if (!chunk.done) {
        streamWriter.write(chunk.content);
      } else {
        streamWriter.end();
      }
    });

    p.log.success(chalk.green("Analysis complete"));
  } catch (error) {
    p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    logger.error("Analyze error:", error);
    process.exit(1);
  }
}

