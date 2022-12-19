import { MyComponent } from "../components/MyComponent.js";
import { MyRectangle } from '../components/MyRectangle.js';

export class Gameboard {
    constructor(scene, p1, p2) {
        this.scene = scene;
        this.p1 = p1;
        this.p2 = p2;
        this.buildFrontFace();
    }

    buildFrontFace() {
        const id = 'checkers-board-front-face';
        this.scene.primitives[id] = new MyRectangle(this.scene.scene, id, this.p1[0], this.p2[0], this.p1[1], this.p2[1]);
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0, this.p1[1]));
        this.scene.components[id] = new MyComponent(this.scene.scene, id, transfMatrix, 'lightWood', 'none', [[true, id]], null, null);
    }
}