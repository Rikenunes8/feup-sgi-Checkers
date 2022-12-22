import { MyComponent } from "../../components/MyComponent.js";
import { diff } from "../utils.js";

export class Board {

    constructor(sceneGraph, id, p1, p2) {
        if (this.constructor == Board) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        this.sceneGraph = sceneGraph;
        this.id = id;
        this.p1 = p1;
        this.p2 = p2;
        this.tranfMatrix = null;
        this.facesIds = [];
        this.tiles = [];
    }

    buildFaces(primitiveId) {
        this.buildFace(primitiveId, 'front');
        this.buildFace(primitiveId, 'back');
        this.buildFace(primitiveId, 'left');
        this.buildFace(primitiveId, 'right');
        this.buildFace(primitiveId, 'bottom');
    }

    buildFace(pritiveId, side) {
        throw new Error("Method 'buildFace()' must be implemented.");
    }


    buildFaceMatrix(side, transfMatrix) {
        if (side == 'front') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0, 0.5));
        } else if (side == 'back') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0, -0.5));
            mat4.rotateY(transfMatrix, transfMatrix, Math.PI);
        } else if (side == 'left') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(-0.5, 0, 0));
            mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        } else if (side == 'right') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0.5, 0, 0));
            mat4.rotateY(transfMatrix, transfMatrix, Math.PI / 2);
        } else if (side == 'bottom') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, -0.5, 0));
            mat4.rotateX(transfMatrix, transfMatrix, Math.PI / 2);
        } else if (side == 'top') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0.5, 0));
            mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
        }
        return transfMatrix;
    }

    buildBoardTransfMatrix() {
        throw new Error("Method 'buildBoardTransfMatrix()' must be implemented.");
    }

    /**
     * Builds the base of the board
     * @param {string} materialId 
     */
    buildBoardBase(materialId) {
        let childs = [];
        for (let id of this.facesIds) {
            childs.push([false, id]);
        }
        this.sceneGraph.components[this.id] =
            new MyComponent(this.sceneGraph.scene, this.id, this.transfMatrix, [materialId], ['none', 1, 1], childs, null, null);
    }

    med(coord) {
        return (this.p2[coord] + this.p1[coord]) / 2;
    }
    diff(coord) {
        return diff(this.p1, this.p2, coord);
    }
}