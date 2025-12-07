import * as p from "@clack/prompts";
import chalk from "chalk";
import { writeFile } from "node:fs/promises";
import { BaseProvider } from "../../providers/base.js";
import { DocumentationGenerator } from "../../docs/generator.js";
import { ContextReader } from "../../context/reader.js";
import { ProjectAnalyzer } from "../../context/analyzer.js";
import { ConfigLoader } from "../../config/loader.js";
import { logger } from "../../utils/logger.js";
import { StreamWriter } from "../../utils/streaming.js";

export async function docsCommand(
  provider: BaseProvider,
  projectPath: string = ".",
  options: { output?: string; type?: "readme" | "api" | "adr" } = {}
) {
  p.intro(chalk.blue("Documentation Generation"));

  try {
    const configLoader = new ConfigLoader();
    const config = await configLoader.load();
    const reader = new ContextReader(config);
    const analyzer = new ProjectAnalyzer();
    const generator = new DocumentationGenerator();

    const spinner = p.spinner();
    spinner.start("Reading project files...");

    const files = await reader.readProject(projectPath);
    const structure = analyzer.analyze(files);
    spinner.stop();

    // Build project context
    const projectContext = `
Project Structure:
- Languages: ${structure.languages.join(", ")}
- Entry Points: ${structure.entryPoints.join(", ")}
- Dependencies: ${structure.dependencies.slice(0, 30).join(", ")}

Key Files:
${files.slice(0, 20).map((f) => `- ${f.relativePath}`).join("\n")}
`;

    spinner.start("Generating documentation...");

    const streamWriter = new StreamWriter((chunk) => {
      if (!chunk.done) {
        process.stdout.write(chunk.content);
      } else {
        process.stdout.write("\n");
      }
    });

    const docs = await generator.generate(provider, projectContext);
    spinner.stop();

    const outputPath = options.output || "README.md";
    await writeFile(outputPath, docs, "utf-8");
    p.log.success(chalk.green(`Documentation written to ${outputPath}`));
  } catch (error) {
    p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    logger.error("Docs error:", error);
    process.exit(1);
  }
}

