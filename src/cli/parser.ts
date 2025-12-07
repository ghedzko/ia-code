import { Command } from "commander";

export function createCLI(): Command {
  const program = new Command();

  program
    .name("ia-code")
    .description("CLI de IA Multi-Proveedor para generación y modificación de código")
    .version("0.1.0");

  return program;
}

