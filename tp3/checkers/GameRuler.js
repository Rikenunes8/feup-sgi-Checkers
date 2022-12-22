import { belongsToPlayer, toArrIndex } from "./utils.js";

export const CurrentPlayer = Object.freeze({
    P1: 0,
    P2: 1,
});

export class GameRuler {
    constructor(checkers) {
        this.checkers = checkers;
    }

    /**
     * Search valid moves for the piece correspondent to pieceIdx
     * @param {*} pieceIdx Index of the piece in the Gameboard pieces array
     * @returns {Array} Array of valid moves for the piece with id pieceIdx
     */
    validMoves(pieceIdx) {
        const piece = this.checkers.pieces[pieceIdx];
        const pieceTile = piece.tile;
        const validMoves = {};

        if (!piece.isKing) {
            this.validSimpleMoves(this.checkers.turn, pieceTile.idx, validMoves, false);
            this.validEatMoves(this.checkers.turn, pieceTile.idx, validMoves, false);
        }
        else {
            this.validSimpleMoves(this.checkers.turn, pieceTile.idx, validMoves, true);
            this.validEatMoves(this.checkers.turn, pieceTile.idx, validMoves, true);
        }
        return validMoves;
    }
    /**
     * Update validMoves with the simple moves (diagonal adjacents) for the piece from tileIdx tile
     * @param {CurrentPlayer} player 
     * @param {int} tileIdx position of the piece in the gameboard
     * @param {Map} validMoves key is the tile index, value is the path to the tile
     * @param {boolean} isKing true if the piece is a king or false if it is a pawn
     */
    validSimpleMoves(player, tileIdx, validMoves, isKing) {
        const pieceRow = Math.floor(tileIdx / 8);
        const pieceCol = tileIdx % 8;
        const rowInc = player == CurrentPlayer.P1 ? 1 : -1;
        for (let i = 0; i < 4; i++) {
            if (!isKing && i == 2) break;
            let tile = toArrIndex(pieceRow + rowInc*Math.pow(-1, Math.floor(i / 2)), pieceCol - Math.pow(-1, i));
            if (this.checkers.game[tile] == -1 && !this.overflowBoard(tile, pieceCol)) {
                validMoves[tile] = [tile];
            }
        }
    }

    /**
     * Update validMoves with eating moves (diagonal jumping one tile of a different player) for the piece from tileIdx tile.
     * If the piece can eat more than one piece, it will add all the possible paths to the validMoves map.
     * @param {CurrentPlayer} player 
     * @param {int} tileIdx position of the piece in the gameboard
     * @param {Map} validMoves key is the tile index, value is the path to the tile
     * @param {boolean} isKing true if the piece is a king or false if it is a pawn
     * @param {*} visited 
     */
    validEatMoves(player, tileIdx, validMoves, isKing, visited = []) {
        const pieceRow = Math.floor(tileIdx / 8);
        const pieceCol = tileIdx % 8;
        const lastPosition = visited.length > 1 ? visited[visited.length - 2] : null;
        const rowInc = player == CurrentPlayer.P1 && !isKing ? 1 : -1;
        for (let i = 0; i < 4; i++) {
            if (!isKing && i == 2) break;
            const tile = toArrIndex(pieceRow + rowInc*Math.pow(-1, Math.floor(i / 2)), pieceCol - Math.pow(-1, i));
            const nextTile = toArrIndex(pieceRow + 2*rowInc*Math.pow(-1, Math.floor(i / 2)), pieceCol - 2*Math.pow(-1, i));
            const pieceId = this.checkers.game[tile];
            if (!belongsToPlayer(pieceId, player) && pieceId != -1 && !this.overflowBoard(tile, pieceCol)
                    && (lastPosition == null || nextTile != lastPosition)) {
                if (this.checkers.game[nextTile] == -1 && !this.overflowBoard(nextTile, pieceCol)) {
                    this.validEatMoves(player, nextTile, validMoves, isKing, [...visited, nextTile]);
                    if (!validMoves[nextTile] || validMoves[nextTile].length <= visited.length) 
                        validMoves[nextTile] = [...visited, nextTile];
                }
            }
        }
    }

    /**
     * Validate if the move is valid for the selected piece
     * @param {*} tileIdx 
     * @returns Array with the path to the tileIdx tile if it is a valid move, null otherwise
     */
    validateMove(tileIdx) {
        const validMoves = this.validMoves(this.checkers.selectedPieceIdx);
        return validMoves[tileIdx];
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
     * Check if the tileIdx tile is more than 2 columns away from the pieceCol column
     * @param {*} tileIdx 
     * @param {*} pieceCol 
     * @returns 
     */
    overflowBoard(tileIdx, pieceCol) {
        return Math.abs(tileIdx % 8 - pieceCol) > 2
    }
}