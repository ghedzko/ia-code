import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface CodeStyle {
  indentSize: number;
  indentType: "spaces" | "tabs";
  quoteStyle: "single" | "double";
  lineEnding: "lf" | "crlf" | "cr";
  trailingComma: "none" | "es5" | "all";
  semicolons: boolean;
  maxLineLength: number;
}

export class StyleAnalyzer {
  async analyzeProject(projectPath: string): Promise<CodeStyle> {
    // Por ahora retornamos valores por defecto
    // Se implementará análisis real más adelante
    return {
      indentSize: 2,
      indentType: "spaces",
      quoteStyle: "double",
      lineEnding: "lf",
      trailingComma: "all",
      semicolons: true,
      maxLineLength: 100,
    };
  }

  async analyzeFile(filePath: string): Promise<Partial<CodeStyle>> {
    try {
      const content = await readFile(filePath, "utf-8");
      const lines = content.split("\n");

      // Análisis básico
      const style: Partial<CodeStyle> = {};

      // Detectar indentación
      for (const line of lines) {
        if (line.trim() && line[0] === " ") {
          let spaces = 0;
          for (let i = 0; i < line.length && line[i] === " "; i++) {
            spaces++;
          }
          if (spaces > 0) {
            style.indentSize = spaces;
            style.indentType = "spaces";
            break;
          }
        } else if (line.trim() && line[0] === "\t") {
          style.indentType = "tabs";
          break;
        }
      }

      // Detectar comillas
      if (content.includes("'")) {
        style.quoteStyle = "single";
      } else {
        style.quoteStyle = "double";
      }

      // Detectar punto y coma
      style.semicolons = content.includes(";");

      return style;
    } catch {
      return {};
    }
  }
}

