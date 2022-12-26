import { toArrIndex } from "./utils.js";

export const CurrentPlayer = Object.freeze({
    P1: Symbol("P1"),
    P2: Symbol("P2"),
});

export const emptyTile = 0;

export class GameRuler {
    constructor(checkers) {
        this.checkers = checkers;
    }

    /**
     * Check if the player has any valid moves.
     * @param {Array} game gameboard array
     * @param {CurrentPlayer} player Player to check moves
     * @returns True if the player has no valid moves, false otherwise.
     */
    checkEndGame(game, player) {
        for (let i = 0; i < game.length; i++) {
            if (this.belongsToPlayer(game[i], player)) {
                const validMoves = this.validMoves(game[i]);
                if (Object.keys(validMoves).length > 0) {
                    return false;
                }
            }
        }
        return true;
    }


    /**
     * Search valid moves for the piece correspondent to pieceIdx
     * @param {*} pieceIdx Index of the piece in the GameBoard pieces array
     * @returns {Array} Array of valid moves for the piece with id pieceIdx
     */
    validMoves(pieceIdx) {
        const piece = this.checkers.getPiece(pieceIdx);
        const pieceTile = piece.tile;
        const validMoves = {};

        if (!piece.isKing()) {
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
            if (this.checkers.game[tile] == emptyTile && !this.overflowBoard(tile, pieceCol)) {
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
            if (!this.belongsToPlayer(pieceId, player) && pieceId != emptyTile && !this.overflowBoard(tile, pieceCol)
                    && (lastPosition == null || nextTile != lastPosition)) {
                if (this.checkers.game[nextTile] == emptyTile && !this.overflowBoard(nextTile, pieceCol)) {
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
        let n = 1;
        for (let v = 0; v < 8; v++) {
            for (let h = 0; h < 8; h++) {
                if ((v + h) % 2 == 0 && (v < 3 || v > 4)) {
                    game[v*8+h] = n++;
                }
                else {
                    game[v*8+h] = emptyTile;
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

    belongsToPlayer(pieceIdx, player) {
        if (player == CurrentPlayer.P1) {
            return (pieceIdx < 13 && pieceIdx > 0) || (pieceIdx > -13 && pieceIdx < 0);
        }
        else {
            return (pieceIdx > 12 && pieceIdx < 25) || (pieceIdx < -12 && pieceIdx > -25);
        }
    }

    isKing(tileIdx) {
        return this.checkers.game[tileIdx] < 0;
    }

    shouldBecomeKing(tileIdx, game) {
        return (this.belongsToPlayer(game[tileIdx], CurrentPlayer.P1) && tileIdx >= 56 && !this.isKing(tileIdx)) 
            || (this.belongsToPlayer(game[tileIdx], CurrentPlayer.P2) && tileIdx <= 7 && !this.isKing(tileIdx)); 
    }

    becomeKing(tileIdx, toKing) {
        const pieceIdx = Math.abs(this.checkers.game[tileIdx]);
        this.checkers.game[tileIdx] = toKing ? -pieceIdx : pieceIdx;
    }

    getPlayer(pieceIdx) {
        if (pieceIdx == emptyTile) return null;
        return this.belongsToPlayer(pieceIdx, CurrentPlayer.P1) ? CurrentPlayer.P1 : CurrentPlayer.P2;
    }
}