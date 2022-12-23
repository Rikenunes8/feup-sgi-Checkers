import { CurrentPlayer, emptyTile } from "./GameRuler.js";

export const GameState = Object.freeze({
    Menu: Symbol("Menu"),
    Pause: Symbol("Pause"),
    Replay: Symbol("Replay"),
    ReplayMoving: Symbol("ReplayMoving"),
    WaitPiecePick: Symbol("WaitPiecePick"),
    WaitTilePick: Symbol("WaitTilePick"),
    Moving: Symbol("Moving"),
    EndGame: Symbol("EndGame")
});

export class GameStateMachine {
    constructor(checkers) {
        this.checkers = checkers;
        this.state = null;
    }

    getState() {
        return this.state;
    }

    /**
     * Call the handler of the new state.
     * @param {GameState} newState New state to be set.
     */
    changeState(newState) {
        this.state = newState;
        if (newState == GameState.Menu) {
            // TODO: Do we want to do something here?
        } else if (newState == GameState.Pause) {
            this.changeStateToPause();
        } else if (newState == GameState.Replay) {
            this.changeStateToReplay();
        } else if (newState == GameState.WaitPiecePick) {
            this.changeStateToWaitPiecePick();
        } else if (newState == GameState.WaitTilePick) {
            this.changeStateToWaitTilePick();
        } else if (newState == GameState.Moving) {
            this.changeStateToMoving();
        } else if (newState == GameState.EndGame) {
            this.changeStateToEndGame();
        } else if (newState == GameState.ReplayMoving) {
            this.changeStateToReplayMoving();
        }
    }

    /**
     * Changes the state to Pause.
     * This state is used when the game is paused.
     * All tiles and pieces are not pickable.
     * The selected piece is unselected.
     */
    changeStateToPause() {
        this.checkers.mainboard.tiles.forEach(t => t.pickable = false);
        this.checkers.pieces.forEach(p => p.pickable = false);
        this.checkers.unselectPiece();
    }

    changeStateToReplay() {
        this.checkers.mainboard.tiles.forEach(t => t.pickable = false);
        this.checkers.pieces.forEach(p => p.pickable = false);
        this.checkers.unselectPiece();
    }

    /**
     * Changes the state to ReplayMoving.
     */
    changeStateToReplayMoving() {

    }

    /**
     * Changes the state to WaitPiecePick.
     * This state is used when the player is waiting for a piece to be selected.
     * All tiles are not pickable.
     * If the player is P1, only pieces 0 to 11 are pickable.
     * If the player is P2, only pieces 12 to 23 are pickable.
     */
    changeStateToWaitPiecePick() {
        this.checkers.mainboard.tiles.forEach(t => t.pickable = false);

        for (let piece of this.checkers.pieces) {
            const isPickable = this.checkers.ruler.belongsToPlayer(piece.idx, this.checkers.turn)
            piece.pickable = isPickable;
        }
    }

    /**
     * Changes the state to WaitTilePick.
     * This state is used when the player has selected a piece and is waiting for a tile to be selected.
     * Only tiles that are empty and are adjacent to the selected piece are pickable.
     * The selected piece is pickable.
     * All other pieces are not pickable.
     */
    changeStateToWaitTilePick() {
        this.checkers.pieces.forEach(p => p.pickable = false);
        this.checkers.getPiece(this.checkers.selectedPieceIdx).pickable = true;
        for (let v = 0; v < 8; v++) for (let h = 0; h < 8; h++) {
            if ((v + h) % 2 == 0 && this.checkers.game[v*8+h] == emptyTile) {
                this.checkers.mainboard.tiles[v*8+h].pickable = true;
            }
        }
    }

    /**
     * Changes the state to Moving.
     */
    changeStateToMoving() {
        this.checkers.mainboard.tiles.forEach(t => t.pickable = false);
        this.checkers.pieces.forEach(p => p.pickable = false);
    }

    /**
     * Changes the state to EndGame.
     */
    changeStateToEndGame() {
        this.checkers.mainboard.tiles.forEach(t => t.pickable = false);
        this.checkers.pieces.forEach(p => p.pickable = false);
        console.log("Game Over!");
    }
}
