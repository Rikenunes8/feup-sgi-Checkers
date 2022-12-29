import { TextBlock } from "../../text/TextBlock.js";
import { sceneButtonBackgroundColor } from "../constants.js";


export class Menu {
    /**
     *
     * @param {*} scene 
     * @param {[x1, y1]} p1 
     * @param {[x2, y2]} p2 
     */
    constructor(scene) {
		this.scene = scene;

		const backgroundColor = sceneButtonBackgroundColor;
		const bgHeight = 1.5;
		const bgWidth = 8;
		const bgX = -34;
		const allign = "center";

		this.startOrPause = new TextBlock(this.scene, 'START', [bgX, 14.5], bgWidth, bgHeight, allign, backgroundColor, this.startOrPauseOnPick);
		this.undo = new TextBlock(this.scene, 'UNDO', [bgX, 12.5], bgWidth, bgHeight, allign, backgroundColor, this.undoOnPick);
		this.replay = new TextBlock(this.scene, 'REPLAY', [bgX, 10.5], bgWidth, bgHeight, allign, backgroundColor, this.replayOnPick);
		this.restart = new TextBlock(this.scene, 'RESTART', [bgX, 8.5], bgWidth, bgHeight, allign, backgroundColor, this.restartOnPick);
		this.changeCam = new TextBlock(this.scene, 'CAMERA', [bgX, 6.5], bgWidth, bgHeight, allign, backgroundColor, this.changeCamOnPick);
		this.goToMenu = new TextBlock(this.scene, 'MENU', [bgX, 4.5], bgWidth, bgHeight, allign, backgroundColor, this.goToMenuOnPick);

		this.buttons = [this.startOrPause, this.undo, this.replay, this.restart, this.changeCam, this.goToMenu];
    }

	/**
	 * Displays all the menu
	 */
	display() {
		const isGameRunning = this.scene.checkers.isGameRunning();
		const isGamePaused = this.scene.checkers.isGamePaused();
		const initText = isGameRunning ? 'PAUSE' : (isGamePaused ? 'RESUME' : 'START');

		this.startOrPause.setText(initText);

		// disable depth test so that it is always in front (need to reenable in the end)
		this.scene.gl.disable(this.scene.gl.DEPTH_TEST);

		this.scene.pushMatrix();
		this.scene.loadIdentity();
		this.scene.translate(0, 0, -50); // move to the front of the camera
		this.scene.scale(0.6, 0.6, 1) // scale to choose font size

		this.buttons.forEach(button => {
			button.display();
		});

		this.scene.popMatrix();
		
		// re-enable depth test 
		this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
	}

	/******************* BUTTONS ACTIONS  ************************/

	startOrPauseOnPick = () => this.scene.checkers.initBtnHandler();
	undoOnPick = () => this.scene.checkers.undoBtnHandler();
	replayOnPick = () => this.scene.checkers.replayBtnHandler();
	restartOnPick = () => this.scene.checkers.resetBtnHandler();
	changeCamOnPick = () => this.scene.checkers.changeCamBtnHandler();
	goToMenuOnPick = () => this.scene.checkers.mainMenuBtnHandler();}