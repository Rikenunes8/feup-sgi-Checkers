import { MyComponent } from "../../components/MyComponent.js";
import { GameboardTile } from '../GameboardTile.js';
import { buildCheckersRectangle } from "../primitives.js";
import { displayGraph } from "../utils.js";
import { Board } from "./Board.js";

export class Gameboard extends Board {
    constructor(sceneGraph, p1, p2, lightTileMaterialId, darkTileMaterialId, boardWallsMaterialId) {
        const id = 'checkers-mainboard';
        super(sceneGraph, id, p1, p2);

        this.transfMatrix = this.buildBoardTransfMatrix();

        this.tiles = [];
        
        const rectangleId = buildCheckersRectangle(this.sceneGraph);
        this.buildFaces(rectangleId);
        this.buildBoardBase(boardWallsMaterialId);
        this.buildTiles(rectangleId, lightTileMaterialId, darkTileMaterialId);
    }

    /**
     * Displays the gameboard by displaying all its components
     * and then the tiles
     */
    display() {
        displayGraph(this.sceneGraph, [false, this.id], null);

        this.sceneGraph.scene.pushMatrix();
        this.sceneGraph.scene.multMatrix(this.transfMatrix);
        for (const tile of this.tiles) {
            tile.display();
        }
        this.sceneGraph.scene.popMatrix();
    }

    buildTiles(primitiveId, lightTileMaterialId, darkTileMaterialId) {
        for (let v = 0; v < 8; v++) {
            for (let h = 0; h < 8; h++) {
                const tileMaterial = (v + h) % 2 != 0 ? lightTileMaterialId : darkTileMaterialId;
                const pickId = (v * 8) + h + 100;
                this.tiles.push(new GameboardTile(this.sceneGraph, this, h, v, primitiveId, tileMaterial, pickId));
            }
        }
    }

    buildFace(primitiveId, side, isMainBoard = true) {
        const id = isMainBoard ? `checkers-board-${side}-face` : `checkers-auxiliarboard-${side}-face`;
        this.facesIds.push(id);
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(4, -0.5, -4));
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(8, 1, 8));
        if (side == 'front') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0, 0.5));
        }
        else if (side == 'back') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0, -0.5));
            mat4.rotateY(transfMatrix, transfMatrix, Math.PI);
        }
        else if (side == 'left') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(-0.5, 0, 0));
            mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        }
        else if (side == 'right') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0.5, 0, 0));
            mat4.rotateY(transfMatrix, transfMatrix, Math.PI / 2);
        }
        else if (side == 'bottom') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, -0.5, 0));
            mat4.rotateX(transfMatrix, transfMatrix, Math.PI / 2);
        }
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(-0.5, -0.5, 0));
        const sideTexture = ['none', 1, 1];
        this.sceneGraph.components[id] = new MyComponent(this.sceneGraph.scene, id, transfMatrix, ['inherit'], sideTexture, [[true, primitiveId]], null, null);
    }

    /**
     * Builds the transformation matrix for gameboard
     * @returns {mat4} The transformation matrix
     */
    buildBoardTransfMatrix() {
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.med(0), this.med(1), this.med(2)));
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(this.diff(0)/8, this.diff(1), this.diff(2)/8));
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(-4, 0.5, 4));
        return transfMatrix;
    }
}