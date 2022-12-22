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
     * @param {*} pieceId 
     * @returns {Array} Array of valid moves for the piece with id pieceId
     */
    validMoves(pieceId) {
        const piece = this.checkers.pieces[pieceId];
        const pieceTile = piece.tile;
        const pieceRow = pieceTile.v;
        const pieceCol = pieceTile.h;
        const validMoves = {};

        if (!piece.isKing) {
            this.validSimpleMoves(this.checkers.turn, pieceRow, pieceCol, validMoves, false);
            this.validEatMoves(this.checkers.turn, pieceRow, pieceCol, validMoves, false);
        }
        else {
            this.validSimpleMoves(this.checkers.turn, pieceRow, pieceCol, validMoves, false);
            this.validSimpleMoves(this.checkers.turn, pieceRow, pieceCol, validMoves, true);
            this.validEatMoves(this.checkers.turn, pieceRow, pieceCol, validMoves, false);
            this.validEatMoves(this.checkers.turn, pieceRow, pieceCol, validMoves, true);
        }
        return validMoves;
    }
    validSimpleMoves(player, pieceRow, pieceCol, validMoves, isKing) {
        const rowInc = player == CurrentPlayer.P1 && !isKing ? 1 : -1;
        const leftTile = toArrIndex(pieceRow+rowInc, pieceCol-1);
        const rightTile = toArrIndex(pieceRow+rowInc, pieceCol+1);

        for (let i = 0; i < 2; i++) {
            const tile = i == 0 ? leftTile : rightTile;
            if (this.checkers.game[tile] == -1) {
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
            if (!belongsToPlayer(this.checkers.game[tile], player) && this.checkers.game[tile] != -1 
                    && (lastPosition == null || toArrIndex(pieceRow+2*rowInc, pieceCol-Math.pow(-1, i)*2) != lastPosition)) {
                const tile2 = toArrIndex(pieceRow+2*rowInc, pieceCol-Math.pow(-1, i)*2);
                if (this.checkers.game[tile2] == -1) {
                    if (!validMoves[tile2]) validMoves[tile2] = [];
                    if (validMoves[tile2].length <= eatenPieces.length) validMoves[tile2] = eatenPieces;
                    validMoves[tile2].push(this.checkers.game[tile]);
                    this.validEatMoves(player, pieceRow+2*rowInc, pieceCol-Math.pow(-1, i)*2, validMoves, isKing, [...eatenPieces, this.checkers.game[tile]], toArrIndex(pieceRow, pieceCol));
                    //this.validEatMoves(player, pieceRow+2*rowInc, pieceCol-Math.pow(-1, i)*2, validMoves, true, [...eatenPieces, this.checkers.game[tile]], toArrIndex(pieceRow, pieceCol));
                }
            }
        }
    }


    validateMove(tileId) {
        const validMoves = this.validMoves(this.checkers.selectedPieceId);
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