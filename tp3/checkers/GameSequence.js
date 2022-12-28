import { GameMove } from './GameMove.js';
import { CurrentPlayer } from './GameRuler.js';
import { GameState } from './GameStateMachine.js';

export class GameSequence {
    constructor(game) {
        this.initialGame = [...game];
        this._gameSequence = [];
        this.replayIndex = 0;
        this.startGame();
    }

    startGame() {
        this._gameSequence.push(new GameMove(null, null, null, this.initialGame));
    }

    addMove(gameMove) {
        this._gameSequence.push(gameMove);
    }

    topMove() {
        return this._gameSequence[this._gameSequence.length - 1];
    }

    getSequence() {
        return this._gameSequence;
    }

    undo() {
        if (this._gameSequence.length > 1) {
            this._gameSequence.pop();
        }
    }

    isEmpty() {
        return this._gameSequence.length == 1;
    }

    replay(checkers, pieceAnimator) {
        this.replayIndex = 1;
        checkers.game = [...this.initialGame];
        checkers.turn = CurrentPlayer.P1;
        checkers.forceGameUpdate(checkers.game);
        this.replayNextMove(checkers, pieceAnimator);
    }

    replayNextMove(checkers, pieceAnimator) {
        if (this.replayIndex < this._gameSequence.length) {
            const move = this._gameSequence[this.replayIndex];
            checkers.selectedPieceIdx = move.piece.idx;
            move.animate(pieceAnimator);
            this.replayIndex++;
            checkers.setState(GameState.ReplayMoving);
        }
        else {
            checkers.setState(GameState.Pause);
        }

    }
}