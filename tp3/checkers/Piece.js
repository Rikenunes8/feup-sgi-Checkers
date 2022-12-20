import { MyComponent } from '../components/MyComponent.js';
import { displayGraph } from './utils.js';

export class Piece {
    constructor(scene, tile, type, materialId, componentref) {
        this.scene = scene;
        this.tile = tile;
        this.type = type;
        this.id = `checkers-piece-${this.tile.v}${this.tile.h}`;
        this.buildPieceComponent(materialId, componentref);

        this.tile.piece = this;
    }

    display() {
        displayGraph(this.scene, [false, this.id], null);
    }

    buildPieceComponent(materialId, componentref) {
        const texture = ['none', 1, 1];
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.tile.h, 0, -this.tile.v));
        this.scene.components[this.id] = new MyComponent(this.scene.scene, this.id, transfMatrix, [materialId], texture, [[false, componentref]], null, null);
    }

}