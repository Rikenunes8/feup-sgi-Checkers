import { MyComponent } from "../components/MyComponent.js";
import { GameboardTile } from './GameboardTile.js';
import { diff, displayGraph } from "./utils.js";
import { buildCheckersRectangle } from "./primitives.js";

export class Gameboard {
    constructor(sceneGraph, p1, p2, lightTileMaterialId, darkTileMaterialId, boardWallsMaterialId) {
        this.sceneGraph = sceneGraph;
        this.id = 'checkers-mainboard';
        this.p1 = p1;
        this.p2 = p2;

        this.transfMatrix = this.buildBoardTransfMatrix();
        
        this.facesIds = [];

        this.tiles = [];
        
        const rectangleId = buildCheckersRectangle(this.sceneGraph);
        this.buildFaces(rectangleId);
        this.buildBoardBase(boardWallsMaterialId);
        this.buildTiles(rectangleId, lightTileMaterialId, darkTileMaterialId);
    }

    display() {
        displayGraph(this.sceneGraph, [false, this.id], null);

        this.sceneGraph.scene.pushMatrix();
        this.sceneGraph.scene.multMatrix(this.transfMatrix);
        for (const tile of this.tiles) {
            tile.display();
        }
        this.sceneGraph.scene.popMatrix();
    }

    buildFaces(primitiveId) {
        this.buildFace(primitiveId, 'front');
        this.buildFace(primitiveId, 'back');
        this.buildFace(primitiveId, 'left');
        this.buildFace(primitiveId, 'right');
        this.buildFace(primitiveId, 'bottom');
    }
    buildFace(primitiveId, side) {
        const id = `checkers-board-${side}-face`;
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

    buildTiles(primitiveId, lightTileMaterialId, darkTileMaterialId) {
        for (let v = 0; v < 8; v++) {
            for (let h = 0; h < 8; h++) {
                const tileMaterial = (v + h) % 2 != 0 ? lightTileMaterialId : darkTileMaterialId;
                const pickId = (v * 8) + h + 100;
                this.tiles.push(new GameboardTile(this.sceneGraph, this, h, v, primitiveId, tileMaterial, pickId));
            }
        }
    }

    buildBoardBase(materialId) {
        let childs = [];
        for (let id of this.facesIds) {
            childs.push([false, id]);
        }
        this.sceneGraph.components[this.id] = new MyComponent(this.sceneGraph.scene, this.id, this.transfMatrix, [materialId], ['none', 1, 1], childs, null, null);
    }

    buildBoardTransfMatrix() {
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.med(0), this.med(1), this.med(2)));
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(this.diff(0)/8, this.diff(1), this.diff(2)/8));
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(-4, 0.5, 4));
        return transfMatrix;
    }

    med(coord) {
        return (this.p2[coord]+this.p1[coord])/2;
    }
    diff(coord) {
        return diff(this.p1, this.p2, coord);
    }
}