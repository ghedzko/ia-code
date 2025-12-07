import { StyleAnalyzer, type CodeStyle } from "../utils/style-analyzer.js";
import type { FileContext } from "./reader.js";

export class StyleDetector {
  private analyzer = new StyleAnalyzer();

  async detectProjectStyle(files: FileContext[]): Promise<CodeStyle> {
    // Analyze multiple files to determine project style
    const styles: Partial<CodeStyle>[] = [];

    for (const file of files.slice(0, 10)) {
      // Only analyze code files
      if (
        file.path.endsWith(".ts") ||
        file.path.endsWith(".tsx") ||
        file.path.endsWith(".js") ||
        file.path.endsWith(".jsx")
      ) {
        const style = await this.analyzer.analyzeFile(file.path);
        styles.push(style);
      }
    }

    // Aggregate styles (take most common)
    return this.aggregateStyles(styles);
  }

  private aggregateStyles(styles: Partial<CodeStyle>[]): CodeStyle {
    const defaultStyle: CodeStyle = {
      indentSize: 2,
      indentType: "spaces",
      quoteStyle: "double",
      lineEnding: "lf",
      trailingComma: "all",
      semicolons: true,
      maxLineLength: 100,
    };

    if (styles.length === 0) {
      return defaultStyle;
    }

    // Count occurrences
    const indentSizes = styles
      .map((s) => s.indentSize)
      .filter((s): s is number => s !== undefined);
    const indentTypes = styles
      .map((s) => s.indentType)
      .filter((s): s is "spaces" | "tabs" => s !== undefined);
    const quoteStyles = styles
      .map((s) => s.quoteStyle)
      .filter((s): s is "single" | "double" => s !== undefined);
    const semicolons = styles
      .map((s) => s.semicolons)
      .filter((s): s is boolean => s !== undefined);

    return {
      indentSize:
        indentSizes.length > 0
          ? this.mostCommon(indentSizes)
          : defaultStyle.indentSize,
      indentType:
        indentTypes.length > 0
          ? this.mostCommon(indentTypes)
          : defaultStyle.indentType,
      quoteStyle:
        quoteStyles.length > 0
          ? this.mostCommon(quoteStyles)
          : defaultStyle.quoteStyle,
      lineEnding: defaultStyle.lineEnding,
      trailingComma: defaultStyle.trailingComma,
      semicolons:
        semicolons.length > 0
          ? this.mostCommon(semicolons)
          : defaultStyle.semicolons,
      maxLineLength: defaultStyle.maxLineLength,
    };
  }

  private mostCommon<T>(arr: T[]): T {
    const counts = new Map<T, number>();
    for (const item of arr) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
    let maxCount = 0;
    let mostCommon = arr[0];
    for (const [item, count] of counts) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    }
    return mostCommon;
  }
}

