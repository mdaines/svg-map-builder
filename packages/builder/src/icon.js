export class Icon {
  constructor({ content, width, height, viewBox, anchorX, anchorY }) {
    this.content = content;
    this.width = width;
    this.height = height;
    this.viewBox = viewBox;
    this.anchorX = anchorX;
    this.anchorY = anchorY;
  }

  render({ document }) {
    return this.content({ document });
  }
}
