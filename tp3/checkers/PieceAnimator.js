export class PieceAnimator {
    constructor(sceneGraph) {
        this.sceneGraph = sceneGraph;
        this.piece = null;
    }

    setPiece(piece, startPosition, endPositions, endTile) {
        this.piece = piece;
        this.startPosition = startPosition;
        this.endPositions = endPositions;
        this.endTile = endTile;
        this.startTime = null;
        this.duration = 500;
    }

    update(time) {
        if (this.piece == null) {
            return false;
        }
        if (this.startTime === null) {
            this.startTime = time;
        }

        const elapsedTime = time - this.startTime;
        if (elapsedTime > this.duration) {
            if (this.endPositions.length > 1) {
                this.startPosition = this.endPositions.shift();
                this.startTime = time;
                return false;
            }
            this.piece.updateTile(this.endTile);
            this.piece = null;
            return true;
        }

        const percentage = elapsedTime / this.duration;
        const position = vec3.create();
        vec3.lerp(position, this.startPosition, this.endPositions[0], percentage);
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, position);
        this.sceneGraph.components[this.piece.id].transfMatrix = transfMatrix;
        return false;
    }
}