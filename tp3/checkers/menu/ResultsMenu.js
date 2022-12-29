import { bgPrimaryColor, bgMainMenuColor } from "../constants.js";
import { CurrentPlayer } from "../GameRuler.js";
import { TextBlock } from "../../text/TextBlock.js";

export class ResultsMenu {
    /**
     *
     * @param {*} scene 
     */
    constructor(scene) {
        this.scene = scene;

        const btnHeight = 2.5;
        const textHeight = 1.5;

        this.background = new TextBlock(this.scene, '', null, [0, 0], 34, 20, null, bgMainMenuColor);
        this.thankYou = new TextBlock(this.scene, 'Thank You!', 'center', [0, -7.5], 11.5, btnHeight, this.thankYouBtnPick, bgPrimaryColor);

        this.congrats = new TextBlock(this.scene, 'CONGRATULATIONS! You ended the game!', 'center', [0, 7.5], 1, textHeight);
        this.announce = new TextBlock(this.scene, 'The winner is.... ', 'center', [0, 6], 1, textHeight);

        this.player1Name = new TextBlock(this.scene, 'Player 1', 'center', [-8, 3], 12, textHeight);
        this.player2Name = new TextBlock(this.scene, 'Player 2', 'center', [8.5, 3], 12, textHeight);
        this.player1Score = new TextBlock(this.scene, '', 'left', [-8, 1], 12, textHeight);
        this.player2Score = new TextBlock(this.scene, '', 'left', [8.5, 1], 12, textHeight);
        this.player1CurrTime = new TextBlock(this.scene, '', 'left', [-8, -0.5], 12, textHeight);
        this.player2CurrTime = new TextBlock(this.scene, '', 'left', [8.5, -0.5], 12, textHeight);
        this.player1TotalTime = new TextBlock(this.scene, '', 'left', [-8, -2], 12, textHeight);
        this.player2TotalTime = new TextBlock(this.scene, '', 'left', [8.5, -2], 12, textHeight);

        this.totalGameTime = new TextBlock(this.scene, '', 'center', [0, -5], 14, textHeight);

        this.textsP1 = [this.player1Name, this.player1Score, this.player1CurrTime, this.player1TotalTime];
        this.textsP2 = [this.player2Name, this.player2Score, this.player2CurrTime, this.player2TotalTime];
        this.texts = [this.congrats, this.announce, ...this.textsP1, ...this.textsP2, this.totalGameTime,];
    }

	/**
	 * Displays all the menu
	 */
	display() {
        this._setUpDisplay();

		// disable depth test so that it is always in front (need to reenable in the end)
		this.scene.gl.disable(this.scene.gl.DEPTH_TEST);

		this.scene.pushMatrix();
		this.scene.loadIdentity();
		this.scene.translate(0, 0, -50); // move to the front of the camera
		this.scene.scale(0.6, 0.6, 1) // scale to choose font size

		this.background.display();
		this.thankYou.display();

        this.texts.forEach(text => text.display());

		this.scene.popMatrix();
		
		// re-enable depth test 
		this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
	}

    _setUpDisplay() {
        const [p1Score, p2Score] = this.scene.checkers.getScores();

        let winnerAnnounce = 'The winner is.... ';
        const winner = this.scene.checkers.results.winner;
        if (winner == CurrentPlayer.P1 || p1Score > p2Score) winnerAnnounce += 'Player 1';
        else if (winner == CurrentPlayer.P2 || p1Score < p2Score) winnerAnnounce += 'Player 2';
        else winnerAnnounce += "Oh. It's a draw!";
        this.announce.setText(winnerAnnounce);

        this.player1Name.setText('Player 1');
        this.player1Score.setText('Score: ' + p1Score + ' points');
        this.player1CurrTime.setText('Current Time: ' + this.scene.checkers.results.p1CurrTime + 's');
        this.player1TotalTime.setText('Total Time: ' + this.scene.checkers.results.p1Time + 's');

        this.player2Name.setText('Player 2');
        this.player2Score.setText('Score: ' + p2Score + ' points');
        this.player2CurrTime.setText('Current Time: ' + this.scene.checkers.results.p2CurrTime + 's');
        this.player2TotalTime.setText('Total Time: ' + this.scene.checkers.results.p2Time + 's');

        this.totalGameTime.setText('Total Game Time: ' + this.scene.checkers.results.totalTime + 's');
    }

	thankYouBtnPick = () => {
		this.scene.checkers.endGameBtnHandler();
	}
}