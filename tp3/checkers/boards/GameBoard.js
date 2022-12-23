import { MyComponent } from "../../components/MyComponent.js";
import { Tile } from '../Tile.js';
import { buildCheckersRectangle } from "../primitives.js";
import { displayGraph } from "../utils.js";
import { Board } from "./Board.js";

export class GameBoard extends Board {
    constructor(sceneGraph, p1, p2, lightTileMaterialId, darkTileMaterialId, boardWallsMaterialId) {
        const id = 'checkers-mainboard';
        super(sceneGraph, id, p1, p2, lightTileMaterialId, darkTileMaterialId, boardWallsMaterialId);

        this.buildBoard();
    }

    buildBoard() {
        this.transfMatrix = this.buildBoardTransfMatrix();
        this.facesIds = [];
        this.tiles = [];

        const rectangleId = buildCheckersRectangle(this.sceneGraph);
        this.buildFaces(rectangleId);
        this.buildBoardBase();
        this.buildTiles(rectangleId);
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

    buildTiles(primitiveId) {
        for (let v = 0; v < 8; v++) {
            for (let h = 0; h < 8; h++) {
                const tileMaterial = (v + h) % 2 != 0 ? this.lightTileMaterialId : this.darkTileMaterialId;
                const pickId = (v * 8) + h + 100;
                this.tiles.push(new Tile(this.sceneGraph, this, h, v, primitiveId, tileMaterial, pickId));
            }
        }
    }

    buildFace(primitiveId, side, isMainBoard = true) {
        const id = isMainBoard ? `checkers-board-${side}-face` : `checkers-auxiliarboard-${side}-face`;
        this.facesIds.push(id);
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(4, -0.5, -4));
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(8, 1, 8));

        transfMatrix = this.buildFaceMatrix(side, transfMatrix);
        
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