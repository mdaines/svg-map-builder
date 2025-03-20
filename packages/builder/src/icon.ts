export class Icon {
  content: (options: { document: Document }) => Node;
  width: number;
  height: number;

  /**
   * @param options
   */
  constructor({ content, width, height }: {
    content: (options: { document: Document }) => Node,
    width: number,
    height: number
  }) {
    this.content = content;
    this.width = width;
    this.height = height;
  }

  /** @internal */
  render({ document }: { document: Document }): Node {
    return this.content({ document });
  }
}
