import { CGFappearance } from "../../../lib/CGF.js";
import { MyButton } from "../../text/MyButton.js";
import { MyRectangle } from "../../components/MyRectangle.js";
import { btnAmbient, mainMenuAmbient, selectedBtnAmbient } from "../constants.js";

export class MainMenu {
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

		this.background = new MyRectangle(scene, 'checkers-mainMenu-background', p1[0], p2[0], p1[1], p2[1]);
		this.initButton = new MyButton(scene, 'checkers-mainMenu-init-button', p1, p2, true, 1000, this.goToScenePick, 'GO TO SCENE', [-3, 6.8, -50]);
		this.theme1Button = new MyButton(scene, 'checkers-mainMenu-theme1-button', p1, p2, true, 1003, () => this.selectTheme(1), 'THEME 1', [-14, 0, -50]);
		this.theme2Button = new MyButton(scene, 'checkers-mainMenu-theme2-button', p1, p2, true, 1004, () => this.selectTheme(2), 'THEME 2', [-1.8, 0, -50]);
		this.theme3Button = new MyButton(scene, 'checkers-mainMenu-theme3-button', p1, p2, true, 1005, () => this.selectTheme(3), 'THEME 3', [10, 0, -50]);
		this.backgroundAppearance = new CGFappearance(scene);
		this.backgroundAppearance.setAmbient(mainMenuAmbient[0], mainMenuAmbient[1], mainMenuAmbient[2], mainMenuAmbient[3]);

		this.buttonAppearance = new CGFappearance(scene);
		this.buttonAppearance.setAmbient(btnAmbient[0], btnAmbient[1], btnAmbient[2], btnAmbient[3]);

		this.selectedBtnAppearance = new CGFappearance(scene);
		this.selectedBtnAppearance.setAmbient(selectedBtnAmbient[0], selectedBtnAmbient[1], selectedBtnAmbient[2], selectedBtnAmbient[3]);
    }

	/**
	 * Displays all the menu
	 */
	display() {
		this.displayButtons();
	}

	/**
	 * Display the buttons of the menu
	 */
	displayButtons() {
		this.turnTimeBtn = new MyButton(this.scene, 'checkers-mainMenu-turnTime-button', this.p1, this.p2, true,
			1001, this.turnTimeBtnOnPick, 'TURN MAX TIME:' + this.scene.checkers.config.turnMaxTime + 's', [-15, -6.7, -50]);
		this.playerTimeBtn = new MyButton(this.scene, 'checkers-mainMenu-playerTime-button', this.p1, this.p2, true,
			1002, this.playerTimeBtnOnPick, 'PLAYER MAX TIME:' + this.scene.checkers.config.playerMaxTime + 'm', [4, -6.7, -50]);

		// Optional: disable depth test so that it is always in front (need to reenable in the end)
		this.scene.gl.disable(this.scene.gl.DEPTH_TEST);
		
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
		if (this.scene.checkers.config.selectedTheme == 1)
			this.selectedBtnAppearance.apply();
		else 
			this.buttonAppearance.apply();
		this.scene.loadIdentity();
		this.scene.scale(0.8, 0.25, 1);
		this.scene.translate(-20, -5, -50);
		this.theme1Button.display();

		if (this.scene.checkers.config.selectedTheme == 2)
			this.selectedBtnAppearance.apply();
		else 
			this.buttonAppearance.apply();
		this.scene.translate(15, 0, 0);
		this.theme2Button.display();

		if (this.scene.checkers.config.selectedTheme == 3)
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
		this.turnTimeBtn.display();
		this.scene.popMatrix();

		// Draw Game Time Button
		this.scene.pushMatrix();
		this.buttonAppearance.apply();
		this.scene.loadIdentity();
		this.scene.scale(1.4, 0.3, 1);
		this.scene.translate(2, -27, -50);
		this.playerTimeBtn.display();
		this.scene.popMatrix();

		// re-enable depth test 
		this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
	}

	goToScenePick = () => {
		this.scene.checkers.goToSceneBtnHandler();
	}

	selectTheme = (num) => {
		this.scene.checkers.config.selectedTheme = num;
	}

	turnTimeBtnOnPick = () => {
		if (this.scene.checkers.config.turnMaxTime == 60)
			this.scene.checkers.config.turnMaxTime = 20;
		else
			this.scene.checkers.config.turnMaxTime += 20;
	}

	playerTimeBtnOnPick = () => {
		if (this.scene.checkers.config.playerMaxTime == 5)
			this.scene.checkers.config.playerMaxTime = 2;
		else
			this.scene.checkers.config.playerMaxTime += 1;
	}
}