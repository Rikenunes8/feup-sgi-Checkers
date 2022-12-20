import { MyComponent } from "../components/MyComponent.js";
import { GameboardTile } from './GameboardTile.js';
import { diff, displayGraph } from "./utils.js";
import { buildCheckersRectangle } from "./primitives.js";

export class Gameboard {
    constructor(scene, p1, p2, lightTileMaterialId, darkTileMaterialId, boardWallsMaterialId) {
        this.scene = scene;
        this.id = 'checkers-mainboard';
        this.p1 = p1;
        this.p2 = p2;

        this.transfMatrix = this.buildBoardTransfMatrix();
        
        this.facesIds = [];

        this.gameboardTiles = [];
        
        const rectangleId = buildCheckersRectangle(this.scene);
        this.buildFaces(rectangleId);
        this.buildBoardBase(boardWallsMaterialId);
        this.buildTiles(rectangleId, lightTileMaterialId, darkTileMaterialId);
    }

    display() {
        displayGraph(this.scene, [false, this.id], null);

        this.scene.scene.pushMatrix();
        this.scene.scene.multMatrix(this.transfMatrix);
        for (const tile of this.gameboardTiles) {
            tile.display();
        }
        this.scene.scene.popMatrix();
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
        this.scene.components[id] = new MyComponent(this.scene.scene, id, transfMatrix, ['inherit'], sideTexture, [[true, primitiveId]], null, null);
    }

    buildTiles(primitiveId, lightTileMaterialId, darkTileMaterialId) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const tileMaterial = (i + j) % 2 != 0 ? lightTileMaterialId : darkTileMaterialId;
                this.gameboardTiles.push(new GameboardTile(this.scene, this, j, i, primitiveId, tileMaterial, this.p1, this.p2));
            }
        }
    }

    buildBoardBase(materialId) {
        let childs = [];
        for (let id of this.facesIds) {
            childs.push([false, id]);
        }
        this.scene.components[this.id] = new MyComponent(this.scene.scene, this.id, this.transfMatrix, [materialId], ['none', 1, 1], childs, null, null);
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