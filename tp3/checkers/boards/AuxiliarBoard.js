import { MyComponent } from "../../components/MyComponent.js";
import { displayGraph } from "../utils.js";
import { buildCheckersRectangle } from "../primitives.js";
import { Board } from "./Board.js";
import { MyButton } from "../../components/MyButton.js";
import { CGFappearance } from "../../../lib/CGF.js";

export class AuxiliarBoard extends Board {
    constructor(sceneGraph, p1, p2, boardWallsMaterialId, buttonsMaterialId) {
        super(sceneGraph, 'checkers-auxiliarboard', p1, p2);

        this.transfMatrix = this.buildBoardTransfMatrix();

        const rectangleId = buildCheckersRectangle(this.sceneGraph);
        this.buildBaseFaces(rectangleId);
        this.buildMenu(rectangleId, buttonsMaterialId);
        this.buildBoardBase(boardWallsMaterialId);
    }

    /**
     * Builds the transformation matrix for auxiliarboard
     * @returns {mat4} The transformation matrix
     */
    buildBoardTransfMatrix() {
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.med(0), this.med(1), this.med(2)));
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(this.diff(0)/8, this.diff(1), this.diff(2)/8));
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 2, 0));
        return transfMatrix;
    }

    display() {
        displayGraph(this.sceneGraph, [false, this.id], null);
        this.displayButtons();
    }

    displayButtons() {
        const scene = this.sceneGraph.scene;

        // TODO Use buttonsMaterialId
        this.buttonAppearance = new CGFappearance(scene);
        this.buttonAppearance.setAmbient(0.776, 0.71, 0.655, 1);

        // Draw init game button
		scene.pushMatrix();
		this.buttonAppearance.apply();
        scene.translate(8.49, 2.8, -1.8);
        scene.scale(1, 0.8, 0.4);
        scene.rotate(-Math.PI / 2, 0, 1, 0);
        this.player1Score.display();
        
        scene.translate(0, -1.5, 0);
        this.player1Time.display();
        
        scene.translate(9.5, 0, 0);
        this.player2Time.display();

        scene.translate(0, 1.5, 0);
        this.player2Score.display();
		scene.popMatrix();
    }

    buildButtons(buttonsMaterialId) {
        this.player1Score = new MyButton(this.sceneGraph.scene, 'checkers-auxiliarBoard-player1Score-button', this.p1, this.p2, true,
            2001, () => {console.log("Player1 Score")});//, 'PLAYER MAX TIME:' + this.sceneGraph.scen.playerMaxTime + 's', [-16, -6.7, -50]);
        
        this.player1Time = new MyButton(this.sceneGraph.scene, 'checkers-auxiliarBoard-player1Time-button', this.p1, this.p2, true,
            2002, () => {console.log("Player1 Time")});//, 'PLAYER MAX TIME:' + this.sceneGraph.scen.playerMaxTime + 's', [-16, -6.7, -50]);
        
        this.player2Time = new MyButton(this.sceneGraph.scene, 'checkers-auxiliarBoard-player2Time-button', this.p1, this.p2, true,
            2003, () => {console.log("Player2 Time")});//, 'PLAYER MAX TIME:' + this.sceneGraph.scen.playerMaxTime + 's', [-16, -6.7, -50]);
        
        this.player2Score = new MyButton(this.sceneGraph.scene, 'checkers-auxiliarBoard-player2Score-button', this.p1, this.p2, true,
            2004, () => {console.log("Player2 Score")});//, 'PLAYER MAX TIME:' + this.sceneGraph.scen.playerMaxTime + 's', [-16, -6.7, -50]);
    }

    /**
     * Builds the menu of the board
     * @param {*} primitiveId 
     */
    buildMenu(primitiveId, buttonsMaterialId) {
        this.buildMenuFaces(primitiveId);
        this.buildButtons(buttonsMaterialId);
    }

    /**
     * Builds all the faces of the Menu
     * @param {*} primitiveId 
     */
    buildMenuFaces(primitiveId) {
        this.buildMenuFace(primitiveId, 'menu-front');
        this.buildMenuFace(primitiveId, 'menu-back');
        this.buildMenuFace(primitiveId, 'menu-left');
        this.buildMenuFace(primitiveId, 'menu-right');
        this.buildMenuFace(primitiveId, 'menu-bottom');
        this.buildMenuFace(primitiveId, 'menu-top');
    }

    /**
     * Builds a face of the Menu
     * @param {*} primitiveId 
     * @param {*} side
     */
    buildMenuFace(primitiveId, side) {
        const id = `checkers-auxiliarboard-${side}-face`;
        this.facesIds.push(id);
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(8.75, -0.5, 0));
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(0.5, 4, 8));
        if (side == 'menu-front') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0, 0.5));
        } else if (side == 'menu-back') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0, -0.5));
            mat4.rotateY(transfMatrix, transfMatrix, Math.PI);
        } else if (side == 'menu-left') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(-0.5, 0, 0));
            mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        } else if (side == 'menu-right') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0.5, 0, 0));
            mat4.rotateY(transfMatrix, transfMatrix, Math.PI / 2);
        } else if (side == 'menu-bottom') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, -0.5, 0));
            mat4.rotateX(transfMatrix, transfMatrix, Math.PI / 2);
        } else if (side == 'menu-top') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0.5, 0));
            mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
        }

        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(-0.5, -0.5, 0));
        const sideTexture = ['none', 1, 1];
        this.sceneGraph.components[id] =
            new MyComponent(this.sceneGraph.scene, id, transfMatrix, ['inherit'], sideTexture, [[true, primitiveId]], null, null);
    }

    /**
     * Build base of the board
     * @param {*} primitiveId 
     */
    buildBaseFaces(primitiveId) {
        this.buildFace(primitiveId, 'front');
        this.buildFace(primitiveId, 'back');
        this.buildFace(primitiveId, 'left');
        this.buildFace(primitiveId, 'right');
        this.buildFace(primitiveId, 'bottom');
        this.buildFace(primitiveId, 'top');
    }
    /**
     * Build each face of the base board
     * @param {*} primitiveId 
     * @param {*} side 
     */
    buildFace(primitiveId, side) {
        const id = `checkers-auxiliarboard-${side}-face`;
        this.facesIds.push(id);
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(7, -2, 0));
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(3, 1, 8));
        if (side == 'front') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0, 0.5));
        }
        else if (side == 'back') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0, -0.5));
            mat4.rotateY(transfMatrix, transfMatrix, Math.PI);
        }
        else if (side == 'left') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(-0.5, 0, 0));
            mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        }
        else if (side == 'right') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0.5, 0, 0));
            mat4.rotateY(transfMatrix, transfMatrix, Math.PI / 2);
        }
        else if (side == 'bottom') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, -0.5, 0));
            mat4.rotateX(transfMatrix, transfMatrix, Math.PI / 2);
        } else if (side == 'top') {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0, 0.5, 0));
            mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
        }

        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(-0.5, -0.5, 0));
        const sideTexture = ['none', 1, 1];
        this.sceneGraph.components[id] = new MyComponent(this.sceneGraph.scene, id, transfMatrix, ['inherit'], sideTexture, [[true, primitiveId]], null, null);
    }



}