export interface ChangeReason {
  file: string;
  change: string;
  reason: string;
  impact: string;
}

export class ReasoningSystem {
  generateReasoning(changes: ChangeReason[]): string {
    return changes
      .map(
        (c) => `File: ${c.file}\nChange: ${c.change}\nReason: ${c.reason}\nImpact: ${c.impact}\n`
      )
      .join("\n---\n\n");
  }
}

