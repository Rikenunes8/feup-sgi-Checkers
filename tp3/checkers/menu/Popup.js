import { TextBlock } from "../../text/TextBlock.js";
import { redPopupColor } from "../constants.js";

export class Popup {
    constructor(scene) {
        this.scene = scene;
        this._popup = new TextBlock(scene, null, "center", [0, -15], 14, 2, null, redPopupColor);
        this._visible = false;
    }

    display() {
		// disable depth test so that it is always in front (need to reenable in the end)
		this.scene.gl.disable(this.scene.gl.DEPTH_TEST);

		this.scene.pushMatrix();
		this.scene.loadIdentity();
		this.scene.translate(0, 0, -50); // move to the front of the camera
		this.scene.scale(0.6, 0.6, 1) // scale to choose font size

		this._popup.display();

		this.scene.popMatrix();
		
		// re-enable depth test 
		this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
    }

    isVisible() {
        return this._visible;
    }

    setVisible(visible) {
        this._visible = visible;
    }

    setText(text) {
        this._popup.setText(text);
    }
}