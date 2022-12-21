import { Piece } from "./Piece.js";
import { buildPieceComponent } from "./primitives.js";
import { belongsToPlayer, toArrIndex } from "./utils.js";

const GameState = Object.freeze({
    Menu: Symbol("Menu"),
    LoadScene: Symbol("LoadScene"),
    WaitPiecePick: Symbol("WaitPiecePick"),
    WaitTilePick: Symbol("WaitTilePick"),
    Moving: Symbol("Moving"),
    EndGame: Symbol("EndGame")
});

const CurrentPlayer = Object.freeze({
    P1: 0,
    P2: 1,
});

export class Checkers {
    constructor (sceneGraph, mainboard, piecesMaterialsIds) {
        this.sceneGraph = sceneGraph;
        this.mainboard = mainboard;
        this.pieces = [];
        
        this.game = this.buildInitialGame();
        
        const pieceComponentsIds = buildPieceComponent(this.sceneGraph);
        this.buildPieces(this.game, pieceComponentsIds, piecesMaterialsIds);

        this.turn = CurrentPlayer.P1;
        this.selectedPieceId = null;
        this.changeState(GameState.WaitPiecePick);
    }

    /**
     * 
     * @param {*} pieceId 
     * @returns {Array} Array of valid moves for the piece with id pieceId
     */
    validMoves(pieceId) {
        const piece = this.pieces[pieceId];
        const pieceTile = piece.tile;
        const pieceRow = pieceTile.v;
        const pieceCol = pieceTile.h;
        const validMoves = {};

        if (!piece.isKing) {
            this.validSimpleMoves(this.turn, pieceRow, pieceCol, validMoves, false);
            this.validEatMoves(this.turn, pieceRow, pieceCol, validMoves, false);
        }
        else {
            this.validSimpleMoves(this.turn, pieceRow, pieceCol, validMoves, false);
            this.validSimpleMoves(this.turn, pieceRow, pieceCol, validMoves, true);
            this.validEatMoves(this.turn, pieceRow, pieceCol, validMoves, false);
            this.validEatMoves(this.turn, pieceRow, pieceCol, validMoves, true);
        }
        return validMoves;
    }
    validSimpleMoves(player, pieceRow, pieceCol, validMoves, isKing) {
        const rowInc = player == CurrentPlayer.P1 && !isKing ? 1 : -1;
        const leftTile = toArrIndex(pieceRow+rowInc, pieceCol-1);
        const rightTile = toArrIndex(pieceRow+rowInc, pieceCol+1);

        for (let i = 0; i < 2; i++) {
            const tile = i == 0 ? leftTile : rightTile;
            if (this.game[tile] == -1) {
                validMoves[tile] = [];
            }
        }
    }
    validEatMoves(player, pieceRow, pieceCol, validMoves, isKing, eatenPieces = [], lastPosition = null) {
        const rowInc = player == CurrentPlayer.P1 && !isKing ? 1 : -1;
        const leftTile = toArrIndex(pieceRow+rowInc, pieceCol-1);
        const rightTile = toArrIndex(pieceRow+rowInc, pieceCol+1);

        for (let i = 0; i < 2; i++) {
            const tile = i == 0 ? leftTile : rightTile;
            if (!belongsToPlayer(this.game[tile], player) && this.game[tile] != -1 
                    && (lastPosition == null || toArrIndex(pieceRow+2*rowInc, pieceCol-Math.pow(-1, i)*2) != lastPosition)) {
                const tile2 = toArrIndex(pieceRow+2*rowInc, pieceCol-Math.pow(-1, i)*2);
                if (this.game[tile2] == -1) {
                    if (!validMoves[tile2]) validMoves[tile2] = [];
                    if (validMoves[tile2].length <= eatenPieces.length) validMoves[tile2] = eatenPieces;
                    validMoves[tile2].push(this.game[tile]);
                    this.validEatMoves(player, pieceRow+2*rowInc, pieceCol-Math.pow(-1, i)*2, validMoves, false, [...eatenPieces, this.game[tile]], toArrIndex(pieceRow, pieceCol));
                    this.validEatMoves(player, pieceRow+2*rowInc, pieceCol-Math.pow(-1, i)*2, validMoves, true, [...eatenPieces, this.game[tile]], toArrIndex(pieceRow, pieceCol));
                }
            }
        }
    }


    validateMove(tileId) {
        const validMoves = this.validMoves(this.selectedPieceId);
        return validMoves[tileId];
    }

    pickTile(id) {
        console.log(`Selected tile: ${id}`);
        const piecesToKill = this.validateMove(id);
        if (piecesToKill != null) {
            const prevTileId = this.game.indexOf(this.selectedPieceId);
            this.game[id] = this.game[prevTileId];
            this.game[prevTileId] = -1;
            piecesToKill.forEach(pieceId => {
                this.game[this.game.indexOf(pieceId)] = -1;
            });

            if (this.turn == CurrentPlayer.P1 && id >= 56 || this.turn == CurrentPlayer.P2 && id <= 7) {
                this.pieces[this.selectedPieceId].becomeKing(true);
            }

            this.unselectPiece();
            this.updateMainboard();
            this.turn = this.turn == CurrentPlayer.P1 ? CurrentPlayer.P2 : CurrentPlayer.P1;
            this.changeState(GameState.WaitPiecePick);
        }
    }
    pickPiece(id) {
        console.log(`Selected piece: ${id}`);
        if (this.selectedPieceId != null) {
            this.unselectPiece();
            this.changeState(GameState.WaitPiecePick);
        } else {
            this.selectPiece(id);
            this.changeState(GameState.WaitTilePick);
        }
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
     * Call the handler of the new state.
     * @param {GameState} newState New state to be set.
     */
    changeState(newState) {
        if (newState == GameState.WaitPiecePick) {
            this.changeStateToWaitPiecePick();
        }
        else if (newState == GameState.WaitTilePick) {
            this.changeStateToWaitTilePick();
        }
    }

    /**
     * Changes the state to WaitPiecePick.
     * This state is used when the player is waiting for a piece to be selected.
     * All tiles are not pickable.
     * If the player is P1, only pieces 0 to 11 are pickable.
     * If the player is P2, only pieces 12 to 23 are pickable.
     */
    changeStateToWaitPiecePick() {
        this.newState = GameState.WaitPiecePick;
        this.mainboard.gameboardTiles.forEach(t => t.pickable = false);

        for (let i = 0; i < this.pieces.length; i++) {
            const isPickable = (this.turn == CurrentPlayer.P1 && i < 12) || (this.turn == CurrentPlayer.P2 && i >= 12);
            this.pieces[i].pickable = isPickable;
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
        this.newState = GameState.WaitTilePick;

        this.pieces.forEach(p => p.pickable = false);
        this.pieces[this.selectedPieceId].pickable = true;
        for (let v = 0; v < 8; v++) for (let h = 0; h < 8; h++) {
            if ((v + h) % 2 == 0 && this.game[v*8+h] == -1) {
                this.mainboard.gameboardTiles[v*8+h].pickable = true;
            }
        }
    }

    /**
     * Call the handler of the picked object.
     * @param {Object} obj Object that was picked.
     * @param {int} customId Pick id of the object.
     * @returns 
     */
    managePick(obj, customId) {
        console.log(`Selected object: ${obj.id}, with pick id ${customId}`);
        if (customId < 0) return;
        // 100 is is a magic number, it is used to separate the type of the object from the id.
        const type = Math.floor(customId / 100);
        const id = customId % 100;
        if (type == 1) {
            this.pickTile(id);
        } else if (type == 2) {
            this.pickPiece(id);
        }
    }

    /**
     * Displays the checkers game.
     */
    display() {
        this.mainboard.display();
    }


    /**
     * Builds the initial game board. -1 tiles are empty, and the rest are filled with pieces numbered from 0 until 23.
     * Pieces under 12 are player 1 pieces, and the rest are player 2 pieces.
     * @returns {Array} An array of 64 elements, representing the game board.
     */
    buildInitialGame() {
        const game = new Array(8*8);
        let n = 0;
        for (let v = 0; v < 8; v++) {
            for (let h = 0; h < 8; h++) {
                if ((v + h) % 2 == 0 && (v < 3 || v > 4)) {
                    game[v*8+h] = n++;
                }
                else {
                    game[v*8+h] = -1;
                }
            }
        }
        return game;
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