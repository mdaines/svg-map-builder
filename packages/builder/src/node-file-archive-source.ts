import { readFile } from "node:fs/promises";
import { type Source } from "pmtiles";

export class NodeFileArchiveSource implements Source {
  filePath: string;
  buffer: Buffer | undefined;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  getKey() {
    return this.filePath;
  }

  async getBytes(offset: number, length: number) {
    if (!this.buffer) {
      this.buffer = await readFile(this.filePath);
    }

    const data = this.buffer.buffer.slice(offset, offset + length);

    return { data };
  }
}
