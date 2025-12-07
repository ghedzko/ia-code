import * as p from "@clack/prompts";
import chalk from "chalk";
import { readFile, writeFile } from "node:fs/promises";
import { BaseProvider } from "../../providers/base.js";
import { AutofixEngine } from "../../autofix/engine.js";
import { FixValidator } from "../../autofix/validator.js";
import { FixReevaluator } from "../../autofix/re-evaluator.js";
import { logger } from "../../utils/logger.js";

export async function autofixCommand(
  provider: BaseProvider,
  filePath: string,
  error?: string
) {
  p.intro(chalk.blue("Auto-fix Code Errors"));

  try {
    const content = await readFile(filePath, "utf-8");
    const engine = new AutofixEngine();
    const validator = new FixValidator();
    const reevaluator = new FixReevaluator();

    if (!error) {
      // Try to detect errors from file content or ask user
      error = await p.text({
        message: "Enter the error message or description:",
        placeholder: "Error description...",
      });

      if (typeof error !== "string" || !error.trim()) {
        p.log.error(chalk.red("Error description is required"));
        process.exit(1);
      }
    }

    const spinner = p.spinner();
    spinner.start("Fixing error...");

    // Extract code from markdown if present
    let fixedCode = await engine.fix(provider, error, content);
    const codeBlockMatch = fixedCode.match(/```[\w]*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      fixedCode = codeBlockMatch[1];
    }

    spinner.stop();

    // Validate fix
    spinner.start("Validating fix...");
    const isValid = await validator.validate(fixedCode, error);
    spinner.stop();

    if (!isValid) {
      p.log.warn(chalk.yellow("Fix validation failed, but proceeding..."));
    }

    // Re-evaluate
    spinner.start("Re-evaluating fix...");
    const reevaluation = await reevaluator.reevaluate(provider, error, fixedCode);
    spinner.stop();

    p.log.info(chalk.blue("Re-evaluation:"));
    console.log(reevaluation);

    // Ask for confirmation
    const shouldApply = await p.confirm({
      message: `Apply fix to ${filePath}?`,
      initialValue: true,
    });

    if (shouldApply) {
      await writeFile(filePath, fixedCode, "utf-8");
      p.log.success(chalk.green(`Fixed code written to ${filePath}`));
    } else {
      p.log.info("Fix cancelled");
      console.log("\nFixed code:\n");
      console.log(fixedCode);
    }
  } catch (error) {
    p.log.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    logger.error("Autofix error:", error);
    process.exit(1);
  }
}

