import { CGFappearance } from "../../../lib/CGF.js";
import { MyButton } from "../../components/MyButton.js";

export class Menu {
    /**
     *
     * @param {*} scene 
     * @param {[x1, y1]} p1 
     * @param {[x2, y2]} p2 
     */
    constructor(scene) {
		this.scene = scene;

		this.buttonAppearance = new CGFappearance(scene);
		this.buttonAppearance.setAmbient(0.776, 0.71, 0.655, 1);
    }

	/**
	 * Displays all the menu
	 */
	display() {
		const isGameRunning = this.scene.checkers.isGameRunning();
		const initText = isGameRunning ? 'PAUSE GAME' : 'START GAME';
		const initCoordX = isGameRunning ? -39.5 : -39;
		this.initButton = new MyButton(this.scene, 'checkers-menu-init-button', [-25.3, 42], [-17, 50], true, 3000, this.initBtnOnPick, initText, [initCoordX, 19.2, -50]);
		this.undoButton = new MyButton(this.scene, 'checkers-menu-undo-button', [-25.3, 32], [-17, 40], true, 3001, this.undoBtnOnPick, 'UNDO', [-37.5, 16.2, -50]);
		this.replayButton = new MyButton(this.scene, 'checkers-menu-replay-button', [-25.3, 22], [-17, 30], true, 3002, this.replayBtnOnPick, 'REPLAY', [-37.5, 13.2, -50]);
		this.mainMenuBtn = new MyButton(this.scene, 'checkers-menu-mainMenu-button', [-25.3, 12], [-17, 20], true, 3003, this.mainMenuOnPick, 'MAIN MENU', [-39.5, 10.2, -50]);

		// Optional: disable depth test so that it is always in front (need to reenable in the end)
		this.scene.gl.disable(this.scene.gl.DEPTH_TEST);

		this.scene.pushMatrix();
		this.displayButtons();
		this.scene.popMatrix();
        
        // re-enable depth test 
		this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
	}

	/**
	 * Display the buttons of the menu
	 */
	displayButtons() {
		// Draw init game button
		this.scene.pushMatrix();
		this.buttonAppearance.apply();
		this.scene.loadIdentity();
		this.scene.scale(1.4, 0.3, 1);
		this.scene.translate(-5, 18, -50);
		this.initButton.display();
		this.scene.popMatrix();

		// Draw undo button
		this.scene.pushMatrix();
		this.buttonAppearance.apply();
		this.scene.loadIdentity();
		this.scene.scale(1.4, 0.3, 1);
		this.scene.translate(-5, 18, -50);
		this.undoButton.display();
		this.scene.popMatrix();

		// Draw go to replay menu button
		this.scene.pushMatrix();
		this.buttonAppearance.apply();
		this.scene.loadIdentity();
		this.scene.scale(1.4, 0.3, 1);
		this.scene.translate(-5, 18, -50);
		this.replayButton.display();
		this.scene.popMatrix();

		// Draw go to main menu button
		this.scene.pushMatrix();
		this.buttonAppearance.apply();
		this.scene.loadIdentity();
		this.scene.scale(1.4, 0.3, 1);
		this.scene.translate(-5, 18, -50);
		this.mainMenuBtn.display();
		this.scene.popMatrix();
	}

	initBtnOnPick = () => {
		console.log("Init button picked");
		this.scene.checkers.initBtnHandler();
	}

	undoBtnOnPick = () => {
		console.log("Undo button picked");
		this.scene.checkers.undoBtnHandler();
	}

	replayBtnOnPick = () => {
		console.log("Replay button picked");
		this.scene.checkers.replayBtnHandler();
	}
	
	mainMenuOnPick = () => {
		console.log("Main menu button picked");
		this.scene.checkers.mainMenuBtnHandler();
	}
}