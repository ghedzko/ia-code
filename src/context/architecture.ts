import type { FileContext } from "./reader.js";
import type { ProjectStructure } from "./analyzer.js";

export interface ArchitectureAnalysis {
  layers: string[];
  dependencies: Map<string, string[]>;
  flows: string[];
  patterns: string[];
}

export class ArchitectureAnalyzer {
  analyze(structure: ProjectStructure): ArchitectureAnalysis {
    const layers: string[] = [];
    const dependencies = new Map<string, string[]>();
    const flows: string[] = [];
    const patterns: string[] = [];

    // Analyze file structure to detect layers
    for (const file of structure.files) {
      const pathParts = file.relativePath.split("/");
      
      // Common layer patterns
      if (pathParts.some((p) => p === "controllers" || p === "routes")) {
        if (!layers.includes("presentation")) {
          layers.push("presentation");
        }
      }
      if (pathParts.some((p) => p === "services" || p === "business")) {
        if (!layers.includes("business")) {
          layers.push("business");
        }
      }
      if (pathParts.some((p) => p === "models" || p === "entities")) {
        if (!layers.includes("data")) {
          layers.push("data");
        }
      }
      if (pathParts.some((p) => p === "utils" || p === "helpers")) {
        if (!layers.includes("utils")) {
          layers.push("utils");
        }
      }
    }

    // Detect common patterns
    if (structure.files.some((f) => f.path.includes("controller"))) {
      patterns.push("MVC");
    }
    if (structure.files.some((f) => f.path.includes("component"))) {
      patterns.push("Component-based");
    }
    if (structure.files.some((f) => f.path.includes("hook"))) {
      patterns.push("React Hooks");
    }

    return {
      layers: layers.length > 0 ? layers : ["monolithic"],
      dependencies,
      flows,
      patterns,
    };
  }
}

