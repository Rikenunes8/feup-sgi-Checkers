import { writeText } from "./utils.js";

export class Menu {
    /**
     * 
     * @param {*} scene 
     * @param {[x1, y1]} p1 
     * @param {[x2, y2]} p2 
     */
    constructor(scene, p1, p2) {
        this.scene = scene;
        this.p1 = p1;
		this.p2 = p2;
		
    }

	display() {
        // activate shader for rendering text characters
		this.scene.setActiveShaderSimple(this.scene.textShader);
		
		// Optional: disable depth test so that it is always in front (need to reenable in the end)
		this.scene.gl.disable(this.scene.gl.DEPTH_TEST);

		// activate texture containing the font
        this.scene.appearance.apply();

        this.scene.pushMatrix();
		// 	Reset transf. matrix to draw independent of camera
		this.scene.loadIdentity();

		// transform as needed to place on screen
		this.scene.translate(-42, 20, -50);

		writeText(this.scene, 'Rui Alves');

        this.scene.popMatrix();
        
        // re-enable depth test 
		this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
	}
	
}