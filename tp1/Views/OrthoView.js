import { CGFcameraOrtho } from "../../lib/CGF.js";
import { View } from "./View.js";

export class OrthoView extends View {
  constructor(id, near, far, from, to, left, right, top, bottom, up) {
    super(id, near, far, from, to);
    
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.up = up;
  }

  /**
   * Creates an CGFcameraOrtho from properties on constructor 
   * @return { CGFcameraOrtho }
   */
  getCamera() {
    return new CGFcameraOrtho(this.left, this.right, this.bottom, this.top, this.near, this.far, this.from, this.to, this.up);
  }

}