import { MyComponent } from "../components/MyComponent.js";
import { MyRectangle } from '../components/MyRectangle.js';

export class Gameboard {
    constructor(scene, p1, p2) {
        this.scene = scene;
        this.p1 = p1;
        this.p2 = p2;
        this.componentsIds = [];
        const sideRectangleId = this.buildBoardSideRectangle();
        this.buildFace(sideRectangleId, 'front');
        this.buildFace(sideRectangleId, 'back');
        this.buildFace(sideRectangleId, 'left');
        this.buildFace(sideRectangleId, 'right');
        this.buildFace(sideRectangleId, 'bottom');
        // this.buildTopFace();
        this.buildBoard();
    }

    buildBoardSideRectangle() {
        const id = 'checkers-rectangle';
        this.scene.primitives[id] = new MyRectangle(this.scene.scene, id, -0.5, 0.5, -0.5, 0.5);
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
        if (side == 'front') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.med(0), this.med(1), this.p1[2]));
            mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(this.diff(0), this.diff(1), 1));
        }
        else if (side == 'back') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.med(0), this.med(1), this.p2[2]));
            mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(this.diff(0), this.diff(1), 1));
            mat4.rotateY(transfMatrix, transfMatrix, Math.PI);
        }
        else if (side == 'left') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.p1[0], this.med(1), this.med(2)));
            mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(1, this.diff(1), this.diff(2)));
            mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        }
        else if (side == 'right') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.p2[0], this.med(1), this.med(2)));
            mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(1, this.diff(1), this.diff(2)));
            mat4.rotateY(transfMatrix, transfMatrix, Math.PI / 2);
        }
        else if (side == 'bottom') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.med(0), this.p1[1], this.med(2)));
            mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(this.diff(0), 1, this.diff(2)));
            mat4.rotateX(transfMatrix, transfMatrix, Math.PI / 2);
        }
        const sideMaterial = this.scene.materials['lightWood'];
        const sideTexture = ['none', 1, 1];
        this.scene.components[id] = new MyComponent(this.scene.scene, id, transfMatrix, [sideMaterial], sideTexture, [[true, primitiveId]], null, null);
    }



    buildBoard() {
        let childs = [];
        for (let id of this.componentsIds) {
            childs.push([false, id]);
        }
        this.scene.components['checkers-mainboard'] = new MyComponent(this.scene.scene, 'checkers-mainboard', mat4.create(), [this.scene.materials['lightWood']], ['none', 1, 1], childs, null, null);
    }

}