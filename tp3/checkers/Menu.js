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
		this.scene.setActiveShaderSimple(this.scene.graph.textShader);

		// Optional: disable depth test so that it is always in front (need to reenable in the end)
		this.scene.gl.disable(this.scene.gl.DEPTH_TEST);

		// activate texture containing the font
        //this.scene.appearance.apply();

        this.scene.pushMatrix();
		// 	Reset transf. matrix to draw independent of camera
		this.scene.loadIdentity();

		// transform as needed to place on screen
		this.scene.translate(-42, 20, -50);

		// set character to display to be in the Nth column, Mth line (0-based)
		// the shader will take care of computing the correct texture coordinates 
		// of that character inside the font texture (check shaders/font.vert )
		// Homework: This should be wrapped in a function/class for displaying a full string

        this.scene.activeShader.setUniformsValues({ 'charCoords': [3, 5] });	// S
		this.scene.graph.quad.display();

		this.scene.translate(1,0,0);
		this.scene.activeShader.setUniformsValues({'charCoords': [7,4]});	// G
		this.scene.graph.quad.display();

		this.scene.translate(1,0,0);
		this.scene.activeShader.setUniformsValues({'charCoords': [9,4]}); // I
		this.scene.graph.quad.display();

        this.scene.popMatrix();
        
        // re-enable depth test 
		this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
    }
}