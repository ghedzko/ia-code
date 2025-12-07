import { MemoryStore } from "./store.js";
import type { CodeStyle } from "../utils/style-analyzer.js";

export class StyleMemory {
  private store: MemoryStore;

  constructor(store: MemoryStore) {
    this.store = store;
  }

  async saveProjectStyle(projectPath: string, style: CodeStyle): Promise<void> {
    await this.store.save(`style:${projectPath}`, style);
  }

  async loadProjectStyle(projectPath: string): Promise<CodeStyle | null> {
    return (await this.store.load(`style:${projectPath}`)) as CodeStyle | null;
  }
}

