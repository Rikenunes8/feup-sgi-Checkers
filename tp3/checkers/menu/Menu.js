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

		const initText = this.scene.info.initedGame ? 'GO TO SCENE' : 'INIT GAME';		

		this.initButton = new MyButton(scene, 'checkers-menu-init-button', [-25.3, 42], [-17, 50], true, 3000, this.initBtnOnPick, initText, [-39, 19.2, -50]);
		this.undoButton = new MyButton(scene, 'checkers-menu-undo-button', [-25.3, 32], [-17, 40], true, 3001, this.undoBtnOnPick, 'UNDO', [-37.5, 16.2, -50]);
		this.mainMenuBtn = new MyButton(scene, 'checkers-menu-mainMenu-button', [-25.3, 22], [-17, 30], true, 3002, this.mainMenuOnPick, 'GO TO MAIN MENU', [-41.5, 13.2, -50]);

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
		this.buttonAppearance.apply();
		this.scene.popMatrix();

		// Draw undo button
		this.scene.pushMatrix();
		this.buttonAppearance.apply();
		this.scene.loadIdentity();
		this.scene.scale(1.4, 0.3, 1);
		this.scene.translate(-5, 18, -50);
		this.undoButton.display();
		this.buttonAppearance.apply();
		this.scene.popMatrix();

		// Draw go to main menu button
		this.scene.pushMatrix();
		this.buttonAppearance.apply();
		this.scene.loadIdentity();
		this.scene.scale(1.4, 0.3, 1);
		this.scene.translate(-5, 18, -50);
		this.mainMenuBtn.display();
		this.buttonAppearance.apply();
		this.scene.popMatrix();
		
	}

	initBtnOnPick = () => {
		// TODO: Change game state
		console.log("Init button picked");
	}

	undoBtnOnPick = () => {
		// TODO: Call undo function
		console.log("Undo button picked");
	}
	
	mainMenuOnPick = () => {
		this.scene.info.initialMenu = true;
	}
}