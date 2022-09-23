import { CGFcamera } from "../../lib/CGF.js";
import { View } from "./View.js";

export class PerspectiveView extends View {

  constructor(id, near, far, from, to, angle) {
    super(id, near, far, from, to);
    
    this.angle = angle;
  }


  /**
   * Creates a CGF Perspective Camera Based on the properties it received on constructos 
   * @return { CGFcamera } (to do probably change this)
   */
  getCamera() {
    // TO DO Change this CGFCamera or 0.2 (check todo on MySceneGraph.js)
    // And what about the Angle?
    return new CGFcamera(0.2, this.near, this.far, this.from, this.to);
  }
}