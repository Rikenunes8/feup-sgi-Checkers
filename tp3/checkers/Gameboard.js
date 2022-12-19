import { MyComponent } from "../components/MyComponent.js";
import { MyCylinder } from "../components/MyCylinder.js";
import { MyRectangle } from '../components/MyRectangle.js';
import { GameboardTile } from './GameboardTile.js';
import { Piece } from './Piece.js';
import { MyTorus } from '../components/MyTorus.js';

export class Gameboard {
    constructor(scene, p1, p2, lightTileMaterialId, darkTileMaterialId, boardWallsMaterialId) {
        this.scene = scene;
        this.id = 'checkers-mainboard';
        this.p1 = p1;
        this.p2 = p2;
        
        this.componentsIds = [];

        this.gameboardTiles = [];
        
        const rectangleId = this.buildCheckersRectangle();
        this.buildFace(rectangleId, 'front');
        this.buildFace(rectangleId, 'back');
        this.buildFace(rectangleId, 'left');
        this.buildFace(rectangleId, 'right');
        this.buildFace(rectangleId, 'bottom');
        this.buildTopFace(rectangleId, lightTileMaterialId, darkTileMaterialId);
        
        this.pieces = [];
        const pieceId = this.buildPiece();
        this.buildPiecesType1(pieceId);
        this.buildPiecesType2(pieceId);

        this.buildBoard(boardWallsMaterialId);
    }

    buildPiece() {
        const id = 'checkers-piece';
        const primitiveId = this.buildCheckersTorus();
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0.5, 0.1, -0.5));
        mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
        this.scene.components[id] = new MyComponent(this.scene.scene, id, transfMatrix, ['inherit'], ['none', 1, 1], [[true, primitiveId]], null, null);
        return id;
    }

    buildCheckersTorus() {
        const id = 'checkers-torus';
        this.scene.primitives[id] = new MyTorus(this.scene.scene, id, 0.2, 0.2, 10, 10);
        return id;
    }
    buildCheckersCylinder() {
        const id = 'checkers-cylinder';
        this.scene.primitives[id] = new MyCylinder(this.scene.scene, id, 0.3, 0.3, 0.4, 10, 4);
        return id;
    }
    buildCheckersRectangle() {
        const id = 'checkers-rectangle';
        this.scene.primitives[id] = new MyRectangle(this.scene.scene, id, 0.0, 1.0, 0.0, 1.0);
        return id;
    }

    med(coord) {
        return (this.p2[coord]+this.p1[coord])/2;
    }

    diff(coord) {
        return Math.abs(this.p2[coord]-this.p1[coord]);
    }

    buildFace(primitiveId, side) {
        const id = `checkers-board-${side}-face`;
        this.componentsIds.push(id);
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

    buildTopFace(primitiveId, lightTileMaterialId, darkTileMaterialId) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const tileMaterial = (i + j) % 2 != 0 ? lightTileMaterialId : darkTileMaterialId;
                this.gameboardTiles.push(new GameboardTile(this.scene, j, i, primitiveId, tileMaterial, this.p1, this.p2));
            }
        }
    }


    buildBoard(materialId) {
        let childs = [];
        for (let id of this.componentsIds) {
            childs.push([false, id]);
        }
        for (let tile of this.gameboardTiles) {
            childs.push([false, tile.id]);
        }
        for (let piece of this.pieces) {
            childs.push([false, piece.id]);
        }
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.med(0), this.med(1), this.med(2)));
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(this.diff(0)/8, this.diff(1), this.diff(2)/8));
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(-4, 0.5, 4));
        this.scene.components[this.id] = new MyComponent(this.scene.scene, this.id, transfMatrix, [materialId], ['none', 1, 1], childs, null, null);
    }

    buildPiecesType1(componentref) {
        let n = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (n == 12) return;
                const isDarkTile = (i + j) % 2 == 0;
                if (isDarkTile) {
                    this.pieces.push(new Piece(this.scene, this.gameboardTiles[i*8+j], 1, 'lightWood', componentref));
                    n++;
                }
            }
        }
    }

    buildPiecesType2(componentref) {
        let n = 0;
        for (let i = 7; i > -1; i--) {
            for (let j = 7; j > -1; j--) {
                if (n == 12) return;
                const isDarkTile = (i + j) % 2 == 0;
                if (isDarkTile) {
                    this.pieces.push(new Piece(this.scene, this.gameboardTiles[i*8+j], 2, 'darkWood', componentref));
                    n++;
                }
            }
        }
    }

}