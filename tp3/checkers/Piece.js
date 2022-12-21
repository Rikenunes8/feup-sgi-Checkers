import { MyComponent } from '../components/MyComponent.js';
import { displayGraph } from './utils.js';
import { Pickable } from './Pickable.js';

export class Piece extends Pickable {
    constructor(sceneGraph, tile, type, materialId, componentref, pickId) {
        super(pickId);
        this.sceneGraph = sceneGraph;
        this.tile = tile;
        this.type = type;
        this.id = `checkers-piece-${pickId-200}`;
        this.buildPieceComponent(materialId, componentref);

        this.tile.piece = this;
    }

    display() {
        this.registerPickable(this.sceneGraph.scene, this);
        displayGraph(this.sceneGraph, [false, this.id], null);
        this.unregisterPickable(this.sceneGraph.scene);
    }

    buildPieceComponent(materialId, componentref) {
        const texture = ['none', 1, 1];
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.tile.h, 0, -this.tile.v));
        this.sceneGraph.components[this.id] = new MyComponent(this.sceneGraph.scene, this.id, transfMatrix, [materialId, 'white'], texture, [[false, componentref]], null, null);
    }

    onPick() {
        // TODO implement
        console.log("OIOI");
    }

    updateTile(tile) {
        this.tile.piece = null;
        this.tile = tile;
        this.tile.piece = this;
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.tile.h, 0, -this.tile.v));
        this.sceneGraph.components[this.id].transfMatrix = transfMatrix;
    }

}