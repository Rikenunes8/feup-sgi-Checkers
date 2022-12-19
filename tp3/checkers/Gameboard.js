import { MyComponent } from "../components/MyComponent.js";
import { MyRectangle } from '../components/MyRectangle.js';

export class Gameboard {
    constructor(scene, p1, p2) {
        this.scene = scene;
        this.p1 = p1;
        this.p2 = p2;
        this.components = [];
        this.buildFrontFace();
    }

    buildFrontFace() {
        let frontFace = new MyRectangle(this.scene.scene, this.p1[0], this.p2[0], this.p1[1], this.p2[1]);
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0, this.p1[1]));
        let component = new MyComponent(this.scene.scene, 'board-front-face', transfMatrix, 'lightWood', 'none', [frontFace], null, null);
        this.components.push(component);
    }

    display() {
        this.components.forEach(component => {
            component.display();
        });
    }
}