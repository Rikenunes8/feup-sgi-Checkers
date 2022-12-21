import { Piece } from "./Piece.js";
import { buildPieceComponent } from "./primitives.js";
import { GameRuler, CurrentPlayer } from "./GameRuler.js";
import { GameStateMachine, GameState } from "./GameStateMachine.js";

export class Checkers {
    constructor (sceneGraph, mainboard, piecesMaterialsIds) {
        this.sceneGraph = sceneGraph;
        this.mainboard = mainboard;
        this.ruler = new GameRuler(this);
        this.stateMachine = new GameStateMachine(this);
        this.animator = null;
        this.pieces = [];
        
        this.game = this.ruler.buildInitialGame();
        
        const pieceComponentsIds = buildPieceComponent(this.sceneGraph);
        this.buildPieces(this.game, pieceComponentsIds, piecesMaterialsIds);

        this.turn = CurrentPlayer.P1;
        this.selectedPieceId = null;
        this.setState(GameState.WaitPiecePick);
    }

    /**
     * Displays the checkers game.
     */
    display() {
        this.mainboard.display();
    }

    update(time) {
        //this.animator.update(time);
    }

    setState(state) {
        this.stateMachine.changeState(state);
    }

    selectPiece(id) {
        this.selectedPieceId = id;
        this.sceneGraph.components[this.pieces[this.selectedPieceId].id].material = 1;
    }

    unselectPiece() {
        this.sceneGraph.components[this.pieces[this.selectedPieceId].id].material = 0;
        this.selectedPieceId = null;
    }

    /**
     * Update mainboard according to the game board.
     * This function is called when the game board is updated.
     * It updates the mainboard tiles and pieces.
     * If a piece is not on the same tile as the piece in the mainboard, it is updated.
     * If a piece is on the same tile as the piece in the mainboard, it is not updated.
     * If a tile is not occupied by a piece, it is set to null.
     */
    updateMainboard() {
        for (let v = 0; v < 8; v++) for (let h = 0; h < 8; h++) {
            const tileId = v*8+h;
            const pieceId = this.game[tileId];
            if (pieceId != -1) {
                const piece = this.pieces[pieceId];
                if (tileId !== piece.tile.pickId % 100) {
                    piece.updateTile(this.mainboard.gameboardTiles[tileId]);
                }
            }
            else {
                this.mainboard.gameboardTiles[tileId].piece = null;
            }
        }
    }

    /**
     * Build the pieces for the game from the game matrix.
     * @param {Array} game An array of 64 elements, representing the game board.
     * @param {string} componentref Component that represents a piece.
     * @param {Array} piecesMaterialsIds Array of materials ids for the pieces. The first element is the material for player 1 pieces, and the second is for player 2 pieces.
     */
    buildPieces(game, componentrefs, piecesMaterialsIds) {
        this.pieces = [];
        for (let i = 0; i < game.length; i++) {
            const type = game[i] <= 11? 1:2;
            if (game[i] != -1) {
                const materialId = piecesMaterialsIds[type-1];
                const pickId = game[i] + 200;
                this.pieces.push(new Piece(this.sceneGraph, this.mainboard.gameboardTiles[i], false, materialId, componentrefs, pickId));
            }
        }
    }

    // TODO: remove this function
    printGame() {
        for (let v = 0; v < 8; v++) {
            console.log(this.game.slice(v*8, v*8+8).join(" "));
        }
    }
}