import { Piece } from "./Piece.js";
import { pawnRadius } from "./primitives.js";
import { Tile } from "./Tile.js";
import { bezier } from "./utils.js";

export const AnimationType = Object.freeze({
    COLLECT: Symbol("collect"),
    COLLECTED: Symbol("collected"),
    KINGIFY: Symbol("kingify")
});

export class PieceAnimator {
    constructor(sceneGraph) {
        this.sceneGraph = sceneGraph;
        /**
         * @type {Object}
         * @property {Object} collector Only one piece can be collecting at a time
         * @property {Array<Object>} collected Can be more than one piece collected at a time
         * @property {Array<Object>} kingifying Can be more than one piece kingified at a time
         */
        this.pieceInfos = {
            collector: null,
            collected: [],
            kingifying: [],
        };
        this.spotlight = null;
    }

    /**
     * Add piece to be animated (collected or collecting)
     * @param {Piece} piece 
     * @param {Array} startPosition Position where the animation starts
     * @param {Array[Array]} endPositions Sequence of positions to visit
     * @param {Tile} linkObject Tile or Piece where the piece will be placed at the end of the animation
     * @param {AnimationType} animType Type of animation (parabolic or linear)
     * @param {int} startTime 
     */
    addPiece(piece, startPosition, endPositions, linkObject, animType, startTime = null) {
        const info = {
            animType: animType,
            piece: piece,
            startPosition: startPosition,
            endPositions: endPositions,
            linkObject: linkObject,
            startTime: startTime,
            duration: vec3.distance(startPosition, endPositions[0]) * (animType == AnimationType.COLLECT ? 300 : 200)
        };

        // In case of a linkObject is a tile, the referenced tile is updated because the transofrmation is calculated relativelly to the tile
        if (info.linkObject instanceof Tile) {
            info.piece.updateTile(info.linkObject);
            this.updatePiece(info, startTime);
        }

        if (animType == AnimationType.COLLECT) {
            this.pieceInfos.collector = info;
            this.spotlight = this.sceneGraph.scene.lights.filter((l) => l.name != undefined && l.name == "checkersSpotlight")[0];
            this.updateSpotlight(info);
            this.spotlight.enable();
        } else if (animType == AnimationType.COLLECTED) {
            this.pieceInfos.collected.push(info);
        } else if (animType == AnimationType.KINGIFY) {
            this.pieceInfos.kingifying.push(info);
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
        this.pieceInfos.kingifying.forEach(pieceInfo => {
            this.updatePiece(pieceInfo, time);
        });
        this.updatePiece(this.pieceInfos.collector, time);
        this.updateSpotlight(this.pieceInfos.collector);

        return this.pieceInfos.collector == null 
            && this.pieceInfos.collected.length == 0
            && this.pieceInfos.kingifying.length == 0;
    }

    /**
     * Update piece animation
     * @param {Object} pieceInfo 
     * @param {int} time 
     * @param {boolean} updateLight
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
            if (pieceInfo.linkObject instanceof Tile) {
                pieceInfo.piece.updateTile(pieceInfo.linkObject);
            } else if (pieceInfo.linkObject instanceof Piece) {
                pieceInfo.linkObject.becomeKing(true, pieceInfo.piece);
            } else {
                throw new Error("PieceAnimator: Invalid link object");
            }

            if (pieceInfo.animType == AnimationType.COLLECT) {
                this.pieceInfos.collector = null;
                this.spotlight.disable();
            } else if (pieceInfo.animType == AnimationType.COLLECTED) {
                this.pieceInfos.collected.splice(this.pieceInfos.collected.indexOf(pieceInfo), 1);
            } else if (pieceInfo.animType == AnimationType.KINGIFY) {
                this.pieceInfos.kingifying.splice(this.pieceInfos.kingifying.indexOf(pieceInfo), 1);
            }
            return true;
        }

        const startPosition = pieceInfo.startPosition;
        const endPosition = pieceInfo.endPositions[0];

        // Update piece position according to interpolation of current and next positions
        const percentage = elapsedTime / pieceInfo.duration;
        let position = vec3.create();
        if (pieceInfo.animType == AnimationType.COLLECT) {
            vec3.lerp(position, startPosition, endPosition, percentage);
        } else {
            const p1 = [...startPosition];  p1[1] = p1[1] + 3;
            const p2 = [...endPosition];    p2[1] = p2[1] + 3;
            position = bezier(position, startPosition, p1, p2, endPosition, percentage)
        }
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, position);
        this.sceneGraph.components[pieceInfo.piece.id].transfMatrix = transfMatrix;

        return false;
    }

    updateSpotlight(pieceInfo) {
        if (pieceInfo == null) {
            return;
        }
        const piece = pieceInfo.piece;
        
        let newPosition = vec3.create();
        let tm = mat4.create();
        mat4.multiply(tm, tm, this.sceneGraph.components[this.sceneGraph.scene.checkers.mainboard.id].transfMatrix);
        mat4.multiply(tm, tm, this.sceneGraph.components[piece.id].transfMatrix);
        mat4.translate(tm, tm, vec3.fromValues(0.5, 1.3, -0.5));
        vec3.transformMat4(newPosition, vec3.fromValues(0, 0, 0), tm);

        this.spotlight.setPosition(newPosition[0], newPosition[1], newPosition[2], 1.0);
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