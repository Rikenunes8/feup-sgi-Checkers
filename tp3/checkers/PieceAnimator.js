import { pawnRadius } from "./primitives.js";

export class PieceAnimator {
    constructor(sceneGraph) {
        this.sceneGraph = sceneGraph;
        /**
         * @type {Object}
         * @property {Object} collector Only one piece can be collecting at a time
         * @property {Array<Object>} collected Can be more than one piece collected at a time
         */
        this.pieceInfos = {
            collector: null,
            collected: []
        };
    }

    /**
     * Add piece to be animated (collected or collecting)
     * @param {Piece} piece 
     * @param {Array} startPosition Position where the animation starts
     * @param {Array[Array]} endPositions Sequence of positions to visit
     * @param {Tile} endTile Tile where the piece will be placed at the end of the animation
     * @param {boolean} isCollected Type of animation (parabolic or linear)
     * @param {int} startTime 
     */
    addPiece(piece, startPosition, endPositions, endTile, isCollected, startTime = null) {
        const info = {
            isCollected: isCollected,
            piece: piece,
            startPosition: startPosition,
            endPositions: endPositions,
            endTile: endTile,
            startTime: startTime,
            duration: vec3.distance(startPosition, endPositions[0]) * (isCollected ? 300 : 500)
        };
        if (isCollected) {
            this.pieceInfos.collected.push(info);
        } else {
            this.pieceInfos.collector = info;
        }
    }

    /**
     * Update all pieces animations
     * @param {*} time 
     * @returns True if all animations are finished
     */
    update(time) {
        this.pieceInfos.collected.forEach(pieceInfo => {
            this.updatePiece(pieceInfo, time);
        });
        this.updatePiece(this.pieceInfos.collector, time);
        return this.pieceInfos.collector == null && this.pieceInfos.collected.length == 0;
    }

    /**
     * Update piece animation
     * @param {Object} pieceInfo 
     * @param {int} time 
     * @returns True if the piece animation is finished
     */
    updatePiece(pieceInfo, time) {
        if (pieceInfo == null) {
            return false;
        }
        if (pieceInfo.startTime === null) {
            pieceInfo.startTime = time;
        }

        const elapsedTime = time - pieceInfo.startTime;
        if (elapsedTime > pieceInfo.duration) {
            // If there are more positions to visit, reset time and erase first position (already visited)
            if (pieceInfo.endPositions.length > 1) {
                pieceInfo.startPosition = pieceInfo.endPositions.shift();
                pieceInfo.startTime = time;
                return false;
            }
            
            // update tile information according to animation type
            if (pieceInfo.isCollected) {
                const tile = pieceInfo.piece.tile;
                tile.piece = null;
                pieceInfo.piece.tile;
                this.pieceInfos.collected.splice(this.pieceInfos.collected.indexOf(pieceInfo), 1);
            } else {
                pieceInfo.piece.updateTile(pieceInfo.endTile);
                this.pieceInfos.collector = null;
            }
            return true;
        }

        // Update piece position according to interpolation of current and next positions
        const percentage = elapsedTime / pieceInfo.duration;
        const position = vec3.create();
        vec3.lerp(position, pieceInfo.startPosition, pieceInfo.endPositions[0], percentage);
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, position);
        this.sceneGraph.components[pieceInfo.piece.id].transfMatrix = transfMatrix;
        return false;
    }

    /**
     * Check if a piece is close enough to be collected
     * @param {Piece} piece Piece in the board to check
     */
    checkCollision(piece) {
        if (this.pieceInfos.collector == null) {
            return false;
        }
        const piecePosition = vec3.create();
        vec3.transformMat4(piecePosition, vec3.fromValues(0, 0, 0), this.sceneGraph.components[piece.id].transfMatrix);

        const thisPosition = vec3.create();
        vec3.transformMat4(thisPosition, vec3.fromValues(0, 0, 0), this.sceneGraph.components[this.pieceInfos.collector.piece.id].transfMatrix);

        const distance = vec3.distance(piecePosition, thisPosition);
        const alreadyCollected = this.pieceInfos.collected.some(pieceInfo => pieceInfo.piece.id == piece.id);
        return distance < pawnRadius*2 && !alreadyCollected;
    }
}