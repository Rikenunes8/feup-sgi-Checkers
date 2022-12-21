import { belongsToPlayer, toArrIndex } from "./utils.js";

export const CurrentPlayer = Object.freeze({
    P1: 0,
    P2: 1,
});

export class GameRuler {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * 
     * @param {*} pieceId 
     * @returns {Array} Array of valid moves for the piece with id pieceId
     */
    validMoves(pieceId) {
        const piece = this.scene.checkers.pieces[pieceId];
        const pieceTile = piece.tile;
        const pieceRow = pieceTile.v;
        const pieceCol = pieceTile.h;
        const validMoves = {};

        if (!piece.isKing) {
            this.validSimpleMoves(this.scene.checkers.turn, pieceRow, pieceCol, validMoves, false);
            this.validEatMoves(this.scene.checkers.turn, pieceRow, pieceCol, validMoves, false);
        }
        else {
            this.validSimpleMoves(this.scene.checkers.turn, pieceRow, pieceCol, validMoves, false);
            this.validSimpleMoves(this.scene.checkers.turn, pieceRow, pieceCol, validMoves, true);
            this.validEatMoves(this.scene.checkers.turn, pieceRow, pieceCol, validMoves, false);
            this.validEatMoves(this.scene.checkers.turn, pieceRow, pieceCol, validMoves, true);
        }
        return validMoves;
    }
    validSimpleMoves(player, pieceRow, pieceCol, validMoves, isKing) {
        const rowInc = player == CurrentPlayer.P1 && !isKing ? 1 : -1;
        const leftTile = toArrIndex(pieceRow+rowInc, pieceCol-1);
        const rightTile = toArrIndex(pieceRow+rowInc, pieceCol+1);

        for (let i = 0; i < 2; i++) {
            const tile = i == 0 ? leftTile : rightTile;
            if (this.scene.checkers.game[tile] == -1) {
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
            if (!belongsToPlayer(this.scene.checkers.game[tile], player) && this.scene.checkers.game[tile] != -1 
                    && (lastPosition == null || toArrIndex(pieceRow+2*rowInc, pieceCol-Math.pow(-1, i)*2) != lastPosition)) {
                const tile2 = toArrIndex(pieceRow+2*rowInc, pieceCol-Math.pow(-1, i)*2);
                if (this.scene.checkers.game[tile2] == -1) {
                    if (!validMoves[tile2]) validMoves[tile2] = [];
                    if (validMoves[tile2].length <= eatenPieces.length) validMoves[tile2] = eatenPieces;
                    validMoves[tile2].push(this.scene.checkers.game[tile]);
                    this.validEatMoves(player, pieceRow+2*rowInc, pieceCol-Math.pow(-1, i)*2, validMoves, isKing, [...eatenPieces, this.scene.checkers.game[tile]], toArrIndex(pieceRow, pieceCol));
                    //this.validEatMoves(player, pieceRow+2*rowInc, pieceCol-Math.pow(-1, i)*2, validMoves, true, [...eatenPieces, this.scene.checkers.game[tile]], toArrIndex(pieceRow, pieceCol));
                }
            }
        }
    }


    validateMove(tileId) {
        const validMoves = this.validMoves(this.scene.checkers.selectedPieceId);
        return validMoves[tileId];
    }
}