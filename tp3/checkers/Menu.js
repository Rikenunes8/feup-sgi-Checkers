import { CGFappearance } from "../../lib/CGF.js";
import { MyRectangle } from "../components/MyRectangle.js";
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
		
		this.background = new MyRectangle(scene, 'checkers-menu-background', p1[0], p2[0], p1[1], p2[1]);
		this.initButton = new MyRectangle(scene, 'checkers-menu-init-button', p1[0], p2[0], p1[1], p2[1]);
		this.configButton = new MyRectangle(scene, 'checkers-menu-config-button', p1[0], p2[0], p1[1], p2[1]);
		this.theme1Button = new MyRectangle(scene, 'checkers-menu-theme1-button', p1[0], p2[0], p1[1], p2[1]);
		this.theme2Button = new MyRectangle(scene, 'checkers-menu-theme2-button', p1[0], p2[0], p1[1], p2[1]);
		this.theme3Button = new MyRectangle(scene, 'checkers-menu-theme3-button', p1[0], p2[0], p1[1], p2[1]);

		this.backgroundAppearance = new CGFappearance(scene);
		this.backgroundAppearance.setAmbient(0.937, 0.905, 0.86, 1);

		this.buttonAppearance = new CGFappearance(scene);
		this.buttonAppearance.setAmbient(0.776, 0.71, 0.655, 1);
    }

	/**
	 * Displays all the menu
	 */
	display() {
		
		this.scene.pushMatrix();
		
		// Optional: disable depth test so that it is always in front (need to reenable in the end)
		this.scene.gl.disable(this.scene.gl.DEPTH_TEST);

		this.displayButtons();
		this.displayText();

		this.scene.popMatrix();
        
        // re-enable depth test 
		this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
	}

	/**
	 * Display the buttons of the menu
	 */
	displayButtons() {
		// draw background
		this.scene.pushMatrix();
		this.scene.loadIdentity();
		this.backgroundAppearance.apply();
		this.scene.scale(4, 2.5, 1);
		this.scene.translate(-5, -5, -50);
		this.background.display();
		this.scene.popMatrix();

		// Draw init game button
		this.scene.pushMatrix();
		this.buttonAppearance.apply();
		this.scene.loadIdentity();
		this.scene.scale(1.4, 0.3, 1);
		this.scene.translate(-5, 18, -50);
		this.initButton.display();
		this.scene.popMatrix();

		// Draw Themes Buttons
		this.scene.pushMatrix();
		this.buttonAppearance.apply();
		this.scene.loadIdentity();
		this.scene.scale(0.8, 0.25, 1);
		this.scene.translate(-20, -5, -50);
		this.theme1Button.display();
		this.scene.translate(15, 0, 0);
		this.theme2Button.display();
		this.scene.translate(15, 0, 0);
		this.theme3Button.display();
		this.scene.popMatrix();

		// Draw Config Game Button
		this.scene.pushMatrix();
		this.buttonAppearance.apply();
		this.scene.loadIdentity();
		this.scene.scale(1.4, 0.3, 1);
		this.scene.translate(-5, -27, -50);
		this.configButton.display();
		this.scene.popMatrix();
	}

	displayText() {
		// activate shader for rendering text characters
		this.scene.setActiveShaderSimple(this.scene.textShader);
		// activate texture containing the font
		this.scene.textAppearance.apply();

		// 	Reset transf. matrix to draw independent of camera
		this.scene.loadIdentity();

		// transform as needed to place on screen
		this.scene.translate(-3, 6.8, -50);
		writeText(this.scene, 'START GAME');

		this.scene.translate(-17.8, -6.8, 0);
		writeText(this.scene, 'THEME 1');
		this.scene.translate(7, 0, 0);
		writeText(this.scene, 'THEME 2');
		this.scene.translate(7, 0, 0);
		writeText(this.scene, 'THEME 3');
		
		this.scene.translate(-18.2, -6.7, 0);
		writeText(this.scene, 'CONFIG GAME');
	}
	
}