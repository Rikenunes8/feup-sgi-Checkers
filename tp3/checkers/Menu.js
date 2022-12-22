import { CGFappearance } from "../../lib/CGF.js";
import { MyButton } from "../components/MyButton.js";
import { MyRectangle } from "../components/MyRectangle.js";

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
		this.initButton = new MyButton(scene, 'checkers-menu-init-button', p1, p2, true, 1000, this.initBtnOnPick, 'START GAME', [-3, 6.8, -50]);
		this.theme1Button = new MyButton(scene, 'checkers-menu-theme1-button', p1, p2, true, 1003, () => this.selectTheme(1), 'THEME 1', [-14, 0, -50]);
		this.theme2Button = new MyButton(scene, 'checkers-menu-theme2-button', p1, p2, true, 1004, () => this.selectTheme(2), 'THEME 2', [-1.8, 0, -50]);
		this.theme3Button = new MyButton(scene, 'checkers-menu-theme3-button', p1, p2, true, 1005, () => this.selectTheme(3), 'THEME 3', [10, 0, -50]);
		this.backgroundAppearance = new CGFappearance(scene);
		this.backgroundAppearance.setAmbient(0.937, 0.905, 0.86, 1);

		this.buttonAppearance = new CGFappearance(scene);
		this.buttonAppearance.setAmbient(0.776, 0.71, 0.655, 1);

		this.selectedBtnAppearance = new CGFappearance(scene);
		this.selectedBtnAppearance.setAmbient(0.608, 0.404, 0.236, 1);
    }

	/**
	 * Displays all the menu
	 */
	display() {
		this.scene.pushMatrix();
		
		// Optional: disable depth test so that it is always in front (need to reenable in the end)
		this.scene.gl.disable(this.scene.gl.DEPTH_TEST);

		this.displayButtons();

		this.scene.popMatrix();
        
        // re-enable depth test 
		this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
	}

	/**
	 * Display the buttons of the menu
	 */
	displayButtons() {
		this.playerTimeBtn = new MyButton(this.scene, 'checkers-menu-playerTime-button', this.p1, this.p2, true,
			1001, this.playerTimeBtnOnPick, 'PLAYER MAX TIME:' + this.scene.info.playerMaxTime + 's', [-16, -6.7, -50]);
		this.gameTimeBtn = new MyButton(this.scene, 'checkers-menu-gameTime-button', this.p1, this.p2, true,
			1002, this.gameTimeBtnOnPick, 'GAME MAX TIME:' + this.scene.info.gameMaxTime + 'm', [4.5, -6.7, -50]);

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
		this.buttonAppearance.apply();
		this.scene.popMatrix();

		// Draw Themes Buttons
		this.scene.pushMatrix();
		if (this.scene.info.selectedTheme == 1)
			this.selectedBtnAppearance.apply();
		else 
			this.buttonAppearance.apply();
		this.scene.loadIdentity();
		this.scene.scale(0.8, 0.25, 1);
		this.scene.translate(-20, -5, -50);
		this.theme1Button.display();

		if (this.scene.info.selectedTheme == 2)
			this.selectedBtnAppearance.apply();
		else 
			this.buttonAppearance.apply();
		this.scene.translate(15, 0, 0);
		this.theme2Button.display();

		if (this.scene.info.selectedTheme == 3)
			this.selectedBtnAppearance.apply();
		else 
			this.buttonAppearance.apply();
		this.scene.translate(15, 0, 0);
		this.theme3Button.display();
		this.scene.popMatrix();

		// Draw Player Time Button
		this.scene.pushMatrix();
		this.buttonAppearance.apply();
		this.scene.loadIdentity();
		this.scene.scale(1.4, 0.3, 1);
		this.scene.translate(-12, -27, -50);
		this.playerTimeBtn.display();
		this.scene.popMatrix();

		// Draw Game Time Button
		this.scene.pushMatrix();
		this.buttonAppearance.apply();
		this.scene.loadIdentity();
		this.scene.scale(1.4, 0.3, 1);
		this.scene.translate(2, -27, -50);
		this.gameTimeBtn.display();
		this.scene.popMatrix();
	}

	initBtnOnPick = () => {
		this.scene.info.initialMenu = false;
	}

	selectTheme = (num) => {
		this.scene.info.selectedTheme = num;
	}

	playerTimeBtnOnPick = () => {
		if (this.scene.info.playerMaxTime == 60)
			this.scene.info.playerMaxTime = 0;
		else
			this.scene.info.playerMaxTime += 20;
	}

	gameTimeBtnOnPick = () => {
		if (this.scene.info.gameMaxTime == 5)
			this.scene.info.gameMaxTime = 2;
		else
			this.scene.info.gameMaxTime += 1;
	}
	
}