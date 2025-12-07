import type { Config } from "../config/schema.js";

export class ExecutionPolicy {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  isAllowed(command: string): boolean {
    const execpolicy = this.config.execpolicy;
    if (!execpolicy) {
      return true;
    }

    // Check blocked commands first
    if (execpolicy.blocked) {
      for (const blocked of execpolicy.blocked) {
        if (command.includes(blocked)) {
          return false;
        }
      }
    }

    // Check allowed commands
    if (execpolicy.allowed) {
      const commandBase = command.split(" ")[0];
      return execpolicy.allowed.some((allowed) => commandBase.includes(allowed));
    }

    return true;
  }
}

