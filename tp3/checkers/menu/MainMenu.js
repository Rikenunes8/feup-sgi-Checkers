import { bgPrimaryColor, bgMainMenuColor, bgSecondaryColor } from "../constants.js";
import { TextBlock } from "../../text/TextBlock.js";

export class MainMenu {
    /**
     *
     * @param {*} scene 
     */
    constructor(scene) {
        this.scene = scene;

		const backgroundColor = bgMainMenuColor;
		const primaryColor = bgPrimaryColor;
		const secondaryColor = bgSecondaryColor;
		const bgHeight = 2.5;
		const allign = 'center';

		this.background = new TextBlock(this.scene, '', null, [0, 0], 34, 20, null, backgroundColor);
		this.goToScene = new TextBlock(this.scene, 'GO TO SCENE', allign, [0, 6], 11.5, bgHeight, this.goToScenePick, primaryColor);
		this.theme1 = new TextBlock(this.scene, 'THEME 1', allign, [-10, 0], 7, bgHeight, () => this.selectTheme(1), primaryColor, secondaryColor);
		this.theme2 = new TextBlock(this.scene, 'THEME 2', allign, [0, 0], 7, bgHeight, () => this.selectTheme(2), primaryColor, secondaryColor);
		this.theme3 = new TextBlock(this.scene, 'THEME 3', allign, [10, 0], 7, bgHeight, () => this.selectTheme(3), primaryColor, secondaryColor);
		this.turnMaxTime = new TextBlock(this.scene, 'TURN MAX TIME', allign, [-8, -6], 14, bgHeight, this.turnTimeBtnOnPick, primaryColor);
		this.playerMaxTime = new TextBlock(this.scene, 'PLAYER MAX TIME', allign, [8, -6], 14, bgHeight, this.playerTimeBtnOnPick, primaryColor);

		this.themes = [this.theme1, this.theme2, this.theme3];
		this.buttons = [this.goToScene, ...this.themes, this.turnMaxTime, this.playerMaxTime];
    }

	/**
	 * Displays all the menu
	 */
	display() {
		this.turnMaxTime.setText('TURN MAX TIME: ' + this.scene.checkers.config.turnMaxTime + 's');
		this.playerMaxTime.setText('PLAYER MAX TIME: ' + this.scene.checkers.config.playerMaxTime + 'm');

		this.themes.forEach((theme, index) => {
			theme.changeBackgroundColor(this.scene.checkers.config.selectedTheme != index + 1);
		});

		// disable depth test so that it is always in front (need to reenable in the end)
		this.scene.gl.disable(this.scene.gl.DEPTH_TEST);

		this.scene.pushMatrix();
		this.scene.loadIdentity();
		this.scene.translate(0, 0, -50); // move to the front of the camera
		this.scene.scale(0.6, 0.6, 1) // scale to choose font size

		this.background.display();
		this.buttons.forEach(button => {
			button.display();
		});

		this.scene.popMatrix();
		
		// re-enable depth test 
		this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
	}


	/******************* BUTTONS ACTIONS  ************************/

	goToScenePick = () => {
		this.scene.checkers.goToSceneBtnHandler();
	}

	selectTheme = (num) => {
		var url = window.location.href;
		url = url.replace(/\?.*/g, '');
		url += '?theme=' + num;
		window.location.href = url;
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