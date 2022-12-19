import { MyComponent } from "../components/MyComponent.js";

export class GameboardTile {
    constructor(scene, h, v, primitiveId, materialId, p1, p2) {
        this.scene = scene;
        this.id = `checkers-tile-${h}${v}`;
        this.h = h;
        this.v = v;
        this.buildTile(primitiveId, materialId, p1, p2);
    }

    diff(p1, p2, coord) {
        return Math.abs(p2[coord] - p1[coord]);
    }

    buildTile(primitiveId, materialId, p1, p2) {
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(
            p1[0] + this.diff(p1, p2, 0)/16 + this.h * this.diff(p1, p2, 0) / 8, 
            p2[1], 
            p1[2] - this.diff(p1, p2, 2)/16 - this.v * this.diff(p1, p2, 2) / 8
        ));
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(this.diff(p1, p2, 0) / 8, 1, this.diff(p1, p2, 2) / 8));
        mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
        let tileTexture = ['none', 1, 1];
        this.scene.components[this.id] = new MyComponent(this.scene.scene, this.id, transfMatrix, [materialId], tileTexture, [[true, primitiveId]], null, null);
    }

}