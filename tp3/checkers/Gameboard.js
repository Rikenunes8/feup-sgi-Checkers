import { MyComponent } from "../components/MyComponent.js";
import { MyRectangle } from '../components/MyRectangle.js';

export class Gameboard {
    constructor(scene, p1, p2) {
        this.scene = scene;
        this.p1 = p1;
        this.p2 = p2;
        this.componentsIds = [];
        const rectangleId = this.buildBoardSideRectangle();
        this.buildFace(rectangleId, 'front');
        this.buildFace(rectangleId, 'back');
        this.buildFace(rectangleId, 'left');
        this.buildFace(rectangleId, 'right');
        this.buildFace(rectangleId, 'bottom');
        this.buildTopFace(rectangleId);
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

    buildTopFace(primitiveId) {
        const vCoord = 'a,b,c,d,e,f,g,h'.split(',');
        const hCoord = '1,2,3,4,5,6,7,8'.split(',');
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const id = `checkers-board-top-face-${vCoord[i]}${hCoord[j]}`;
                this.componentsIds.push(id);
                let transfMatrix = mat4.create();
                mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.p1[0] + this.diff(0)/16 + j * this.diff(0) / 8, this.p2[1], this.p1[2] - this.diff(2) / 16 - i * this.diff(2) / 8));
                mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(this.diff(0) / 8, 1, this.diff(2) / 8));
                mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
                const tileMaterial = (i + j) % 2 != 0 ? this.scene.materials['white'] : this.scene.materials['black'];
                let tileTexture = ['none', 1, 1];
                this.scene.components[id] = new MyComponent(this.scene.scene, id, transfMatrix, [tileMaterial], tileTexture, [[true, primitiveId]], null, null);
            }
        }
    }


    buildBoard() {
        let childs = [];
        for (let id of this.componentsIds) {
            childs.push([false, id]);
        }
        this.scene.components['checkers-mainboard'] = new MyComponent(this.scene.scene, 'checkers-mainboard', mat4.create(), [this.scene.materials['lightWood']], ['none', 1, 1], childs, null, null);
    }

}