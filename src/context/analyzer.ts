import type { FileContext } from "./reader.js";

export interface ProjectStructure {
  files: FileContext[];
  languages: string[];
  entryPoints: string[];
  dependencies: string[];
}

export class ProjectAnalyzer {
  analyze(files: FileContext[]): ProjectStructure {
    const languages = new Set<string>();
    const entryPoints: string[] = [];
    const dependencies: string[] = [];

    for (const file of files) {
      // Detect language from extension
      const ext = file.path.split(".").pop()?.toLowerCase();
      if (ext) {
        languages.add(ext);
      }

      // Detect entry points
      if (
        file.path.includes("index.") ||
        file.path.includes("main.") ||
        file.path.includes("app.") ||
        file.path.endsWith("package.json")
      ) {
        entryPoints.push(file.relativePath);
      }

      // Extract dependencies from package.json
      if (file.path.endsWith("package.json")) {
        try {
          const pkg = JSON.parse(file.content);
          if (pkg.dependencies) {
            dependencies.push(...Object.keys(pkg.dependencies));
          }
          if (pkg.devDependencies) {
            dependencies.push(...Object.keys(pkg.devDependencies));
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    return {
      files,
      languages: Array.from(languages),
      entryPoints,
      dependencies: Array.from(new Set(dependencies)),
    };
  }
}

