import { View } from "./View";

export class OrthoView extends View {
  constructor(id, near, far, from, to, left, right, top, bottom) {
    super(id, near, far, from, to);
    
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }

}