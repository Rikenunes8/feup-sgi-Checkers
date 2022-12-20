import { MyComponent } from "../components/MyComponent.js";
import { Pickable } from "./Pickable.js";
import { displayGraph } from "./utils.js";

export class GameboardTile extends Pickable {
    constructor(sceneGraph, board, h, v, primitiveId, materialId, pickId) {
        super(pickId);
        this.sceneGraph = sceneGraph;
        this.board = board;
        this.id = `checkers-tile-${v}${h}`;
        this.h = h;
        this.v = v;
        this.buildTile(primitiveId, materialId);
        this.piece = null;
    }

    display() {
        this.registerPickable(this.sceneGraph.scene, this);//, this.sceneGraph.components[this.id]);
        displayGraph(this.sceneGraph, [false, this.id], null);
        this.unregisterPickable(this.sceneGraph.scene);

        if (this.piece) {
            this.piece.display();
        }
    }

    buildTile(primitiveId, materialId) {
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.h, 0, -this.v));
        mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
        let tileTexture = ['none', 1, 1];
        this.sceneGraph.components[this.id] = new MyComponent(this.sceneGraph.scene, this.id, transfMatrix, [materialId], tileTexture, [[true, primitiveId]], null, null);
    }

    onPick() {
        // TODO implement
        console.log("OLA");
    }
}