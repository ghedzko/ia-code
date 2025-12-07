import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

export interface MemoryEntry {
  key: string;
  value: unknown;
  timestamp: number;
}

export class MemoryStore {
  private storagePath: string;

  constructor(storagePath?: string) {
    this.storagePath = storagePath || join(homedir(), ".ia-code", "memory");
  }

  async save(key: string, value: unknown): Promise<void> {
    await mkdir(this.storagePath, { recursive: true });
    const filePath = join(this.storagePath, `${key}.json`);
    const entry: MemoryEntry = {
      key,
      value,
      timestamp: Date.now(),
    };
    await writeFile(filePath, JSON.stringify(entry, null, 2), "utf-8");
  }

  async load(key: string): Promise<unknown | null> {
    try {
      const filePath = join(this.storagePath, `${key}.json`);
      const content = await readFile(filePath, "utf-8");
      const entry = JSON.parse(content) as MemoryEntry;
      return entry.value;
    } catch {
      return null;
    }
  }
}

