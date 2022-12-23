import { MyComponent } from "../../components/MyComponent.js";
import { displayGraph, writeText } from "../utils.js";
import { buildCheckersRectangle } from "../primitives.js";
import { Board } from "./Board.js";
import { MyButton } from "../../components/MyButton.js";
import { Tile } from "../Tile.js";

export class AuxiliarBoard extends Board {
    constructor(sceneGraph, p1, p2, boardWallsMaterialId, buttonsMaterialId, lightTileMaterialId, darkTileMaterialId) {
        super(sceneGraph, 'checkers-auxiliarboard', p1, p2);

        this.transfMatrix = this.buildBoardTransfMatrix();

        this.buttonsMaterialId = buttonsMaterialId;

        const rectangleId = buildCheckersRectangle(this.sceneGraph);
        this.buildFaces(rectangleId);
        this.buildMenu(rectangleId);
        this.buildBoardBase(boardWallsMaterialId);
        this.buildTiles(rectangleId, lightTileMaterialId, darkTileMaterialId);
    }

    /**
     * Builds tiles with 12 pieces for each player
     * @param {*} primitiveId 
     * @param {*} lightTileMaterialId 
     * @param {*} darkTileMaterialId 
     */
    buildTiles(primitiveId, lightTileMaterialId, darkTileMaterialId) {
        for (let v = 0; v < 8; v++) {
            for (let h = 0; h < 3; h++) {
                const tileMaterial = (v + h) % 2 != 0 ? lightTileMaterialId : darkTileMaterialId;
                const pickId = (v * 8) + h + 300;
                this.tiles.push(new Tile(this.sceneGraph, this, h, v, primitiveId, tileMaterial, pickId));
            }
        }
    }

    /**
     * Builds the transformation matrix for auxiliarboard
     * @returns {mat4} The transformation matrix
     */
    buildBoardTransfMatrix() {
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.med(0), this.med(1), this.med(2)));
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(this.diff(0) / 3, this.diff(1), this.diff(2) / 8));
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(-1.5, 0.5, 4)); //  h / 2, 0.5, v / 2
        return transfMatrix;
    }

    display() {
        displayGraph(this.sceneGraph, [false, this.id], null);
        const scene = this.sceneGraph.scene;

        scene.pushMatrix();
        scene.multMatrix(this.transfMatrix);
        for (const tile of this.tiles) {
            tile.display();
        }
        this.displayButtons();
        scene.popMatrix();
    }

    displayButtons() {
        const scene = this.sceneGraph.scene;

        let transfMatrix;
        
        this.buttonAppearance = this.sceneGraph.materials[this.buttonsMaterialId];

        // Display Player2
        scene.pushMatrix();
        transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(3 - 0.01, 4.2, -6.3));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(0.3, 0.6, 1));
        scene.multMatrix(transfMatrix);

        writeText(scene, 'PLAYER 2');
        scene.popMatrix();

        // Display Player1
        scene.pushMatrix();
        transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(3 - 0.01, 4.2, -2.7));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(0.3, 0.6, 1));
        scene.multMatrix(transfMatrix);

        writeText(scene, 'PLAYER 1');
        scene.popMatrix();

        
        // Draw player2 Score
        scene.pushMatrix();
        transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(3 - 0.01, 3.2, -6.3));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(0.3, 0.5, 1));
        scene.multMatrix(transfMatrix);
        // TODO instead of 10 go get the player score
        writeText(scene, 'Score:' + 10);
        scene.popMatrix();

        // Draw player2 Time
        scene.pushMatrix();
        transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(3 - 0.01, 2.5, -6.3));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(0.3, 0.5, 1));
        scene.multMatrix(transfMatrix);
        writeText(scene, 'Time:' + scene.checkers.results.p2Time + 's');
        scene.popMatrix();

        // Draw player1 Score
        scene.pushMatrix();
        transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(3 - 0.01, 3.2, -2.7));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(0.3, 0.5, 1));
        scene.multMatrix(transfMatrix);
        // TODO instead of 10 go get the player score
        writeText(scene, 'Score:' + 10);
        scene.popMatrix();

        // Draw player1 Time
        scene.pushMatrix();
        transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(3 - 0.01, 2.5, -2.7));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(0.3, 0.5, 1));
        scene.multMatrix(transfMatrix);
        writeText(scene, 'Time:' + scene.checkers.results.p1Time + 's');
        scene.popMatrix();

        // Draw Total Time
        scene.pushMatrix();
        transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(3 - 0.01, 1, -5.7));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(0.3, 0.5, 1));
        scene.multMatrix(transfMatrix);
        writeText(scene, 'Total Game Time:' + scene.checkers.results.totalTime + 's');
        scene.popMatrix();
    }

    /*
    buildButtons() {
        // TODO try to use text inside the button and not outside
        this.player1Score = new MyButton(this.sceneGraph.scene, 'checkers-auxiliarBoard-player1Score-button', [-0.5, -0.5], [0.5, 0.5], false);//, 'PLAYER MAX TIME:' + this.sceneGraph.scene.playerMaxTime + 's', [-16, -6.7, -50]);
        
        this.player1Time = new MyButton(this.sceneGraph.scene, 'checkers-auxiliarBoard-player1Time-button', [-0.5, -0.5], [0.5, 0.5], false);//, 'PLAYER MAX TIME:' + this.sceneGraph.scen.playerMaxTime + 's', [-16, -6.7, -50]);
        
        this.player2Time = new MyButton(this.sceneGraph.scene, 'checkers-auxiliarBoard-player2Time-button', [-0.5, -0.5], [0.5, 0.5], false);//, 'PLAYER MAX TIME:' + this.sceneGraph.scen.playerMaxTime + 's', [-16, -6.7, -50]);
        
        this.player2Score = new MyButton(this.sceneGraph.scene, 'checkers-auxiliarBoard-player2Score-button', [-0.5, -0.5], [0.5, 0.5], false);//, 'PLAYER MAX TIME:' + this.sceneGraph.scen.playerMaxTime + 's', [-16, -6.7, -50]);
        
        this.totalTime = new MyButton(this.sceneGraph.scene, 'checkers-auxiliarBoard-initGame-button', [-0.5, -0.5], [0.5, 0.5], false);//, 'PLAYER MAX TIME:' + this.sceneGraph.scen.playerMaxTime + 's', [-16, -6.7, -50]);
    } */

    /**
     * Builds the menu of the board
     * @param {*} primitiveId 
     */
    buildMenu(primitiveId) {
        this.buildMenuFaces(primitiveId);
        // this.buildButtons();
    }

    /**
     * Builds all the faces of the Menu
     * @param {*} primitiveId 
     */
    buildMenuFaces(primitiveId) {
        this.buildFace(primitiveId, 'front', true);
        this.buildFace(primitiveId, 'back', true);
        this.buildFace(primitiveId, 'left', true);
        this.buildFace(primitiveId, 'right', true);
        this.buildFace(primitiveId, 'bottom', true);
        this.buildFace(primitiveId, 'top', true);
    }


    /**
     * Builds a face of the Menu
     * @param {*} primitiveId 
     * @param {*} side
     */
    buildFace(primitiveId, side, isMenu = false) {
        const id = isMenu ? `checkers-auxiliarboard-menu-${side}-face` : `checkers-auxiliarboard-${side}-face`;
        this.facesIds.push(id);
        let transfMatrix = mat4.create();
        if (isMenu) {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(3.5, 2, -4));
            mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(1, 6, 8));
        } else {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(1.5, -0.5, -4));
            mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(3, 1, 8));
        }

        transfMatrix = this.buildFaceMatrix(side, transfMatrix);

        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(-0.5, -0.5, 0));
        const sideTexture = ['none', 1, 1];
        this.sceneGraph.components[id] = new MyComponent(this.sceneGraph.scene, id, transfMatrix, ['inherit'], sideTexture, [[true, primitiveId]], null, null);
    }


}