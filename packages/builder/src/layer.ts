import { type Layout } from "./layout.js";
import { type Icon } from "./icon.js";

export interface Layer {
  render: (options: {
    document: Document,
    layout: Layout,
    icons: Record<string, Icon>
  }) => Promise<Node | undefined>
}
