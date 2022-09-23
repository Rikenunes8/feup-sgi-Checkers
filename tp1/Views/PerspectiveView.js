import { View } from "./View";

export class PerspsectiveView extends View {

  constructor(id, near, far, from, to, angle) {
    super(id, near, far, from, to);
    
    this.angle = angle;
  }


}