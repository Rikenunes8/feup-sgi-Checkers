import { MyComponent } from "../components/MyComponent.js";
import { displayGraph } from "./utils.js";

export class GameboardTile {
    constructor(scene, board, h, v, primitiveId, materialId) {
        this.scene = scene;
        this.board = board;
        this.id = `checkers-tile-${h}${v}`;
        this.h = h;
        this.v = v;
        this.buildTile(primitiveId, materialId);
        this.piece = null;
    }

    display() {
        displayGraph(this.scene, [false, this.id], null);
        if (this.piece) {
            this.piece.display();
        }
    }

    buildTile(primitiveId, materialId) {
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.h, 0, -this.v));
        mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
        let tileTexture = ['none', 1, 1];
        this.scene.components[this.id] = new MyComponent(this.scene.scene, this.id, transfMatrix, [materialId], tileTexture, [[true, primitiveId]], null, null);
    }
}