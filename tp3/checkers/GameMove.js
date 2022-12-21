class GameMove {
    constructor(piece, from, to, gameboard) {
        this.piece = piece;
        this.from = from;
        this.to = to;
        this.gameboard = gameboard;
    }

    animate() {
        throw new Error("Method not implemented.");
    }
}