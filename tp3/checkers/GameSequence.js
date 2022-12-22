class GameSequence {
    constructor() {
        this._gameSequence = [];
    }

    addGame(gameMove) {
        this._gameSequence.push(gameMove);
    }

    topGame() {
        return this._gameSequence[this._gameSequence.length - 1];
    }

    getGameSequence() {
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