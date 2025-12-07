export interface StreamChunk {
  content: string;
  done: boolean;
}

export type StreamHandler = (chunk: StreamChunk) => void;

export class StreamWriter {
  private handler: StreamHandler;
  private buffer: string = "";

  constructor(handler: StreamHandler) {
    this.handler = handler;
  }

  write(chunk: string) {
    this.buffer += chunk;
    this.handler({ content: chunk, done: false });
  }

  end() {
    this.handler({ content: this.buffer, done: true });
    this.buffer = "";
  }

  getBuffer(): string {
    return this.buffer;
  }
}

