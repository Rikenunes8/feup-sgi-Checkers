import { GameMove } from './GameMove.js';

export class GameSequence {
    constructor(game) {
        this.initialGame = [...game];
        this._gameSequence = [];
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
        if (this._gameSequence.length > 0) {
            this._gameSequence.pop();
        }
    }

    // TODO: check this
    sequenceReplay() {
        if (this._gameSequence.length > 0) {
            this._gameSequence.forEach(gameMove => {
                gameMove.animate();
            });
        }
    }
}