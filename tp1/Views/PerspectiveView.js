import { View } from "./View.js";

export class PerspectiveView extends View {

  constructor(id, near, far, from, to, angle) {
    super(id, near, far, from, to);
    
    this.angle = angle;
  }


}