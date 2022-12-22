import { Piece } from "./Piece.js";
import { buildPieceComponent } from "./primitives.js";
import { GameRuler, CurrentPlayer } from "./GameRuler.js";
import { GameStateMachine, GameState } from "./GameStateMachine.js";
import { PieceAnimator } from "./PieceAnimator.js";

export class Checkers {
    constructor (sceneGraph, mainboard, auxiliarboard, piecesMaterialsIds) {
        this.sceneGraph = sceneGraph;
        this.mainboard = mainboard;
        this.ruler = new GameRuler(this);
        this.stateMachine = new GameStateMachine(this);
        this.pieceAnimator = new PieceAnimator(this);
        this.auxiliarboard = auxiliarboard;
        this.pieces = [];
        
        this.game = this.ruler.buildInitialGame();
        
        const pieceComponentsIds = buildPieceComponent(this.sceneGraph);
        this.buildPieces(this.game, pieceComponentsIds, piecesMaterialsIds);

        this.turn = CurrentPlayer.P1;
        this.selectedPieceIdx = null;
        this.setState(GameState.WaitPiecePick);
        this.interval = setInterval(this.updateTime, 1000);
    }

    /**
     * Updates the time of each player and total
     * time of the Game
     */
    updateTime = () => {
        // TODO Check if game already initialized using GameStateMachine probably
        // reset these times when game ends and we click init game again
        const scene = this.sceneGraph.scene;
        console.log("OLA: ", scene.info.initedGame);
        if (scene.info.initedGame) {
            scene.info.totalTime += 1;

            if (this.turn == CurrentPlayer.P1) {
                scene.info.p1Time += 1;
            } else {   
                scene.info.p2Time += 1;
            }
        }
    }

    /**
     * Update the checkers game on moving state
     * Update the piece animations
     * Check for colisions with other pieces
     * @param {*} time 
     */
    update(time) {
        if (this.stateMachine.getState() == GameState.Moving) {
            // animate piece movement (collector and collected pieces)
            if (this.pieceAnimator.update(time)) {
                const prevTileId = this.game.indexOf(this.selectedPieceIdx);
                const tileIdx = this.pieces[this.selectedPieceIdx].tile.idx;
                this.game[tileIdx] = this.game[prevTileId];
                this.game[prevTileId] = -1;
        
                if (this.turn == CurrentPlayer.P1 && tileIdx >= 56 || this.turn == CurrentPlayer.P2 && tileIdx <= 7) {
                    this.pieces[this.selectedPieceIdx].becomeKing(true);
                }

                this.unselectPiece();
                this.turn = this.turn == CurrentPlayer.P1 ? CurrentPlayer.P2 : CurrentPlayer.P1;
                if (this.ruler.checkEndGame(this.game, this.turn))
                    this.setState(GameState.EndGame);
                else
                    this.setState(GameState.WaitPiecePick);
            }

            // check for colision with other pieces
            for (let i = 0; i < this.pieces.length; i++) {
                if (i != this.selectedPieceIdx) {
                    const piece = this.pieces[i];
                    if (this.pieceAnimator.checkCollision(piece)) {
                        console.log("Collision with piece " + i);
                        const prevTileId = this.game.indexOf(piece.idx);
                        this.game[prevTileId] = -1;
                        const prevTilePos = [piece.tile.h, 0, -piece.tile.v];
                        const nextTilePoss = [[10, 0, -10]]; // TODO: get tile position
                        this.pieceAnimator.addPiece(piece, prevTilePos, nextTilePoss, null, true, time);
                        break;
                    }
                }
            }

        }
    }

    /**
     * Change the game state.
     * @param {GameState} state 
     */
    setState(state) {
        this.stateMachine.changeState(state);
    }

    /**
     * Select a piece. Change its material.
     * @param {int} idx 
     */
    selectPiece(idx) {
        this.selectedPieceIdx = idx;
        this.sceneGraph.components[this.pieces[this.selectedPieceIdx].id].material = 1;
    }

    /**
     * Unselect the selected piece. Return to original material.
     */
    unselectPiece() {
        this.sceneGraph.components[this.pieces[this.selectedPieceIdx].id].material = 0;
        this.selectedPieceIdx = null;
    }

    /**
     * Displays the checkers game.
     */
    display() {
        this.mainboard.display();
        this.auxiliarboard.display();
    }

    /**
     * Start piece movement animation.
     * @param {Piece} piece Piece to animate.
     * @param {GameboardTile} prevTile Start tile
     * @param {Array[GameboardTile]} nextTiles Tiles to visit
     */
    movePiece(piece, prevTile, nextTiles) {
        // Put piece color to original
        this.sceneGraph.components[piece.id].material = 0;
        
        const lastTile = nextTiles[nextTiles.length-1];
        const prevTilePos = [prevTile.h, 0, -prevTile.v];
        const nextTilePoss = nextTiles.map(tile => [tile.h, 0, -tile.v]);
        this.pieceAnimator = new PieceAnimator(this.sceneGraph);
        this.pieceAnimator.addPiece(piece, prevTilePos, nextTilePoss, lastTile, false);
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
                this.pieces.push(new Piece(this.sceneGraph, this.mainboard.tiles[i], false, materialId, componentrefs, pickId));
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