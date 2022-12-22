export class GameMove {
    constructor(piece, from, to, gameboard) {
        this.piece = piece;
        this.from = from;
        this.to = to;
        this.gameboard = [...gameboard];
    }

    animate(pieceAnimator) {
        const lastTile = this.to[this.to.length-1];
        const prevTilePos = [this.from.h, 0, -this.from.v];
        const nextTilePoss = this.to.map(tile => [tile.h, 0, -tile.v]);
        pieceAnimator.addPiece(this.piece, prevTilePos, nextTilePoss, lastTile, false);
    }
}