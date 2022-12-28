import { CGFappearance } from "../../../lib/CGF.js";
import { MyButton } from "../../text/MyButton.js";
import { MyRectangle } from "../../components/MyRectangle.js";
import { btnAmbient, resultsMenuAmbient } from "../constants.js";
import { CurrentPlayer } from "../GameRuler.js";

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
        this.scene.loadIdentity();
        this.buttonAppearance.apply();
        this.scene.translate(0, -10, -50);
        this.thankYouBtn.display();

        this.scene.scale(1, 1.2, 1);
        this.scene.translate(-11.5, 15, 0);
        this.scene.texter.writeText('CONGRATULATIONS! You ended the game!');

        this.scene.translate(-24, -2, 0);
        this.scene.texter.writeText('The winner is.....');

        let wasDraw = false;
        if (this.scene.checkers.results.winner == CurrentPlayer.P2) {
            this.scene.texter.writeText('Player 2!');
        } else if (this.scene.checkers.results.winner == CurrentPlayer.P1) {
            this.scene.texter.writeText('Player 1!');
        } else if (p1Score > p2Score) {
            this.scene.texter.writeText('Player 1!');
        } else if (p1Score < p2Score) {
            this.scene.texter.writeText('Player 2!');
        } else {
            wasDraw = true;
            this.scene.texter.writeText("Oh. It's a draw!");
        }

        const infoTranslate = wasDraw ? -30 : -25;
        // show player 1 information
        const p1Xtranslate = p1Score > 10 ? -11.2 : -10.5;
        const p1timeXtranslate = this.scene.checkers.results.p1CurrTime > 10 ? -11.9 : -11.2;

        this.scene.translate(infoTranslate, -2.5, 0);
        this.scene.texter.writeText('Player 1 Information');
        this.scene.translate(-14.1, -1.5, 0);
        this.scene.texter.writeText('Score: ' + p1Score + ' points');
        this.scene.translate(p1Xtranslate, -1.5, 0);
        this.scene.texter.writeText('Current Time: ' + this.scene.checkers.results.p1CurrTime + 's');
        this.scene.translate(p1timeXtranslate, -1.5, 0);
        this.scene.texter.writeText('Total Time: ' + this.scene.checkers.results.p1Time + 's');

        // show player 2 information
        const p2Xtranslate = p2Score > 10 ? -11.2 : -10.5;
        const p2timeXtranslate = this.scene.checkers.results.p2CurrTime > 10 ? -11.9 : -11.2;
        this.scene.translate(10, 4.5, 0);
        this.scene.texter.writeText('Player 2 Information');
        this.scene.translate(-14.1, -1.5, 0);
        this.scene.texter.writeText('Score: ' + p2Score + ' points');
        this.scene.translate(p2Xtranslate, -1.5, 0);
        this.scene.texter.writeText('Current Time: ' + this.scene.checkers.results.p2CurrTime + 's');
        this.scene.translate(p2timeXtranslate, -1.5, 0);
        this.scene.texter.writeText('Total Time: ' + this.scene.checkers.results.p2Time + 's');

        // show game information (total time)
        this.scene.translate(-20, -2, 0);
        this.scene.texter.writeText('TOTAL GAME TIME: ' + this.scene.checkers.results.totalTime + 's');

        this.scene.popMatrix();

        this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
	}

	thankYouBtnPick = () => {
		this.scene.checkers.endGameBtnHandler();
	}
}