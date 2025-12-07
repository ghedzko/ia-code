import { MemoryStore } from "./store.js";

export interface ProjectContext {
  conventions: string[];
  patterns: string[];
  preferences: Record<string, unknown>;
}

export class ProjectContextMemory {
  private store: MemoryStore;

  constructor(store: MemoryStore) {
    this.store = store;
  }

  async saveContext(projectPath: string, context: ProjectContext): Promise<void> {
    await this.store.save(`context:${projectPath}`, context);
  }

  async loadContext(projectPath: string): Promise<ProjectContext | null> {
    return (await this.store.load(`context:${projectPath}`)) as ProjectContext | null;
  }
}

