import { readFile } from "node:fs/promises";

export class NodeFileArchiveSource {
  constructor(filePath) {
    this.filePath = filePath;
  }

  getKey() {
    return this.filePath;
  }

  async getBytes(offset, length) {
    if (!this.buffer) {
      this.buffer = await readFile(this.filePath);
    }

    const data = this.buffer.buffer.slice(offset, offset + length);

    return { data };
  }
}
