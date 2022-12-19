import { MyComponent } from "../components/MyComponent.js";
import { MyRectangle } from '../components/MyRectangle.js';

export class Gameboard {
    constructor(scene, p1, p2) {
        this.scene = scene;
        this.p1 = p1;
        this.p2 = p2;
        this.componentsIds = [];
        this.buildFrontFace();
        this.buildBackFace();
        this.buildLeftFace();
        this.buildRightFace();
        this.buildBottomFace();
        // this.buildTopFace();
        this.buildBoard();
    }

    buildFrontFace() {
        const id = 'checkers-board-front-face';
        this.componentsIds.push(id);
        this.scene.primitives[id] = new MyRectangle(this.scene.scene, id, this.p1[0], this.p2[0], this.p1[1], this.p2[1]);
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0, this.p1[2]));
        this.scene.components[id] = new MyComponent(this.scene.scene, id, transfMatrix, [this.scene.materials['lightWood']], ['none', 1, 1], [[true, id]], null, null);
    }

    buildBackFace() {
        const id = 'checkers-board-back-face';
        this.componentsIds.push(id);
        this.scene.primitives[id] = new MyRectangle(this.scene.scene, id, this.p1[0], this.p2[0], this.p1[1], this.p2[1]);
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0, this.p2[2]));
        mat4.rotateY(transfMatrix, transfMatrix, Math.PI);
        this.scene.components[id] = new MyComponent(this.scene.scene, id, transfMatrix, [this.scene.materials['lightWood']], ['none', 1, 1], [[true, id]], null, null);
    }

    buildLeftFace() {
        const id = 'checkers-board-left-face';
        this.componentsIds.push(id);
        this.scene.primitives[id] = new MyRectangle(this.scene.scene, id, this.p1[2], this.p2[2], this.p1[1], this.p2[1]);
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.p1[0], 0, 0));
        mat4.rotateY(transfMatrix, transfMatrix, Math.PI / 2);
        this.scene.components[id] = new MyComponent(this.scene.scene, id, transfMatrix, [this.scene.materials['lightWood']], ['none', 1, 1], [[true, id]], null, null);
    }

    buildRightFace() {
        const id = 'checkers-board-right-face';
        this.componentsIds.push(id);
        this.scene.primitives[id] = new MyRectangle(this.scene.scene, id, this.p1[2], this.p2[2], this.p1[1], this.p2[1]);
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.p2[0], 0, 0));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        this.scene.components[id] = new MyComponent(this.scene.scene, id, transfMatrix, [this.scene.materials['lightWood']], ['none', 1, 1], [[true, id]], null, null);
    }

    buildBottomFace() {
        const id = 'checkers-board-bottom-face';
        this.componentsIds.push(id);
        this.scene.primitives[id] = new MyRectangle(this.scene.scene, id, this.p1[0], this.p2[0], this.p1[2], this.p2[2]);
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, this.p1[1], 0));
        mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
        this.scene.components[id] = new MyComponent(this.scene.scene, id, transfMatrix, [this.scene.materials['lightWood']], ['none', 1, 1], [[true, id]], null, null);
    }


    buildBoard() {
        let childs = [];
        for (let id of this.componentsIds) {
            childs.push([false, id]);
        }
        this.scene.components['checkers-mainboard'] = new MyComponent(this.scene.scene, 'checkers-board', mat4.create(), [this.scene.materials['lightWood']], ['none', 1, 1], childs, null, null);
    }

}