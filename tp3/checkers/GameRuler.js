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
     * 
     * @param {*} pieceIdx 
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
    validSimpleMoves(player, tileIdx, validMoves, isKing) {
        const pieceRow = Math.floor(tileIdx / 8);
        const pieceCol = tileIdx % 8;
        const rowInc = player == CurrentPlayer.P1 ? 1 : -1;
        for (let i = 0; i < 4; i++) {
            if (!isKing && i == 2) break;
            let tile = toArrIndex(pieceRow + rowInc*Math.pow(-1, Math.floor(i / 2)), pieceCol - Math.pow(-1, i));
            if (this.checkers.game[tile] == -1 && Math.abs(tile % 8 - pieceCol) <= 2) {
                validMoves[tile] = [tile];
            }
        }
    }
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
            if (!belongsToPlayer(pieceId, player) && pieceId != -1 && Math.abs(tile % 8 - pieceCol) <= 2
                    && (lastPosition == null || nextTile != lastPosition)) {
                if (this.checkers.game[nextTile] == -1 && Math.abs(nextTile % 8 - pieceCol) <= 2) {
                    this.validEatMoves(player, nextTile, validMoves, isKing, [...visited, nextTile]);
                    if (!validMoves[nextTile] || validMoves[nextTile].length <= visited.length) 
                        validMoves[nextTile] = [...visited, nextTile];
                }
            }
        }
    }


    validateMove(tileId) {
        const validMoves = this.validMoves(this.checkers.selectedPieceId);
        console.log(validMoves);
        return validMoves[tileId];
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
}