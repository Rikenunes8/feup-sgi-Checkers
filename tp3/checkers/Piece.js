import { MyComponent } from '../components/MyComponent.js';

export class Piece {
    constructor(scene, tile, type, materialId, primitives) {
        this.scene = scene;
        this.tile = tile;
        this.type = type;
        this.id = `checkers-piece-${this.tile.v}${this.tile.h}`;
        this.buildPiece(materialId, primitives);
    }

    buildPiece(materialId, primitives) {
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.tile.h, 0.5, this.tile.v));
        this.scene.components[this.id] = new MyComponent(this.scene.scene, this.id, transfMatrix, [materialId], ['none', 1, 1], primitives, null, null);
    }

}