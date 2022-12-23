import { CGFappearance } from "../../../lib/CGF.js";
import { MyButton } from "../../components/MyButton.js";
import { MyRectangle } from "../../components/MyRectangle.js";
import { btnAmbient, resultsMenuAmbient } from "../constants.js";
import { writeText } from "../utils.js";

export class ResultsMenu {
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

		this.background = new MyRectangle(scene, 'checkers-winnerMenu-background', this.p1[0], this.p2[0], this.p1[1], this.p2[1]);
		this.thankYouBtn = new MyButton(scene, 'checkers-winnerMenu-button', [-8, 0], [8, 3], true, 4000, this.thankYouBtnPick, 'Thank You!', [-3, -8.5, -50]);
		this.backgroundAppearance = new CGFappearance(scene);
		this.backgroundAppearance.setAmbient(resultsMenuAmbient[0], resultsMenuAmbient[1], resultsMenuAmbient[2], resultsMenuAmbient[3]);

		this.buttonAppearance = new CGFappearance(scene);
		this.buttonAppearance.setAmbient(btnAmbient[0], btnAmbient[1], btnAmbient[2], btnAmbient[3]);
    }

	/**
	 * Displays all the menu
	 */
    display() {
        this.displayMenu();
	}

	/**
	 * Display the buttons of the menu
	 */
    displayMenu() {
        const [p1Score, p2Score] = this.scene.checkers.getScores();

        this.scene.gl.disable(this.scene.gl.DEPTH_TEST);

		// draw background
		this.scene.pushMatrix();
		this.scene.loadIdentity();
		this.backgroundAppearance.apply();
		this.scene.scale(4, 2.5, 1);
		this.scene.translate(-5, -5, -50);
        this.background.display();
        this.scene.popMatrix();

        // Draw Menu information and btns
        this.scene.pushMatrix();
        this.buttonAppearance.apply();
        this.scene.loadIdentity();
        this.scene.translate(0, -10, -50);
        this.thankYouBtn.display();

        this.scene.scale(1, 1.2, 1);
        this.scene.translate(-11.5, 15, 0);
        writeText(this.scene, 'CONGRATULATIONS! You ended the game!');

        this.scene.translate(-24, -2, 0);
        writeText(this.scene, 'The winner is.....');
        if (p1Score > p2Score) {
            writeText(this.scene, 'Player 1!');
        } else if (p1Score < p2Score) {
            writeText(this.scene, 'Player 2!');
        } else {
            writeText(this.scene, "Oh. It's a draw!");
        }

        // show player 1 information
        const p1Xtranslate = p1Score > 10 ? -11.2 : -10.5;
        this.scene.translate(-25, -2.5, 0);
        writeText(this.scene, 'Player 1 Information');
        this.scene.translate(-14.1, -1.5, 0);
        writeText(this.scene, 'Score: ' + p1Score + ' points');
        this.scene.translate(p1Xtranslate, -1.5, 0);
        writeText(this.scene, 'Total Time: ' + this.scene.checkers.results.p1Time + 's');

        // show player 2 information
        const p2Xtranslate = p2Score > 10 ? -11.2 : -10.5;
        this.scene.translate(10, 3, 0);
        writeText(this.scene, 'Player 2 Information');
        this.scene.translate(-14.1, -1.5, 0);
        writeText(this.scene, 'Score: ' + p2Score + ' points');
        this.scene.translate(p2Xtranslate, -1.5, 0);
        writeText(this.scene, 'Total Time: ' + this.scene.checkers.results.p2Time + 's');

        // show game information (total time)
        this.scene.translate(-20, -3, 0);
        writeText(this.scene, 'TOTAL GAME TIME: ' + this.scene.checkers.results.totalTime + 's');

        this.scene.popMatrix();

        this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
	}

	thankYouBtnPick = () => {
		this.scene.checkers.endGameBtnHandler();
	}
}