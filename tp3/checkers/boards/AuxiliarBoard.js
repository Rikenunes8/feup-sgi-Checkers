import { MyComponent } from "../../components/MyComponent.js";
import { displayGraph, writeText } from "../utils.js";
import { buildCheckersRectangle } from "../primitives.js";
import { Board } from "./Board.js";
import { MyButton } from "../../components/MyButton.js";
import { GameboardTile } from "../GameboardTile.js";

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
                const pickId = (v * 8) + h + 100;
                this.tiles.push(new GameboardTile(this.sceneGraph, this, h, v, primitiveId, tileMaterial, pickId));
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

        this.buttonAppearance = this.sceneGraph.materials[this.buttonsMaterialId];
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(-0.5, 0, 0));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        //scene.multMatrix(transfMatrix);

        // Draw player1 Score button
		scene.pushMatrix();
		this.buttonAppearance.apply();
        scene.translate(8.49, 2.8, -1.8);
        scene.scale(1, 0.8, 0.4);
        scene.rotate(-Math.PI / 2, 0, 1, 0);
        this.player1Score.display();
        scene.scale(0.5, 0.5, 0.5);
        scene.translate(-6, 1, 0.1);
        // TODO instead of 10 go get the player score
        writeText(scene, 'PLAYER 1 SCORE: ' + 10 + 's');

        // Draw player1 Time button
        scene.scale(2, 2, 2);
        this.buttonAppearance.apply();
        scene.translate(-3.5, -2, 0);
        this.player1Time.display();
        scene.scale(0.5, 0.5, 0.5);
        scene.translate(-6, 1, 0.1);
        // TODO use the player time
        writeText(scene, 'PLAYER 1 TIME: ' + 10 + 's');

        scene.scale(2, 2, 2);
        this.buttonAppearance.apply();
        scene.translate(6, -0.5, 0);
        this.player2Time.display();
        scene.scale(0.5, 0.5, 0.5);
        scene.translate(-6, 1, 0.1);
        // TODO use the player time
        writeText(scene, 'PLAYER 2 TIME: ' + 10 + 's');

        scene.scale(2, 2, 2);
        this.buttonAppearance.apply();
        scene.translate(-3.1, 1, 0);
        this.player2Score.display();
        scene.scale(0.5, 0.5, 0.5);
        scene.translate(-6, 1, 0.1);
        // TODO instead of 10 go get the player score
        writeText(scene, 'PLAYER 2 SCORE: ' + 10 + 's');
		scene.popMatrix();
    }

    buildButtons() {
        // TODO try to use text inside the button and not outside
        this.player1Score = new MyButton(this.sceneGraph.scene, 'checkers-auxiliarBoard-player1Score-button', this.p1, this.p2, false);//, 'PLAYER MAX TIME:' + this.sceneGraph.scene.playerMaxTime + 's', [-16, -6.7, -50]);
        
        this.player1Time = new MyButton(this.sceneGraph.scene, 'checkers-auxiliarBoard-player1Time-button', this.p1, this.p2, false);//, 'PLAYER MAX TIME:' + this.sceneGraph.scen.playerMaxTime + 's', [-16, -6.7, -50]);
        
        this.player2Time = new MyButton(this.sceneGraph.scene, 'checkers-auxiliarBoard-player2Time-button', this.p1, this.p2, false);//, 'PLAYER MAX TIME:' + this.sceneGraph.scen.playerMaxTime + 's', [-16, -6.7, -50]);
        
        this.player2Score = new MyButton(this.sceneGraph.scene, 'checkers-auxiliarBoard-player2Score-button', this.p1, this.p2, false);//, 'PLAYER MAX TIME:' + this.sceneGraph.scen.playerMaxTime + 's', [-16, -6.7, -50]);
    }

    /**
     * Builds the menu of the board
     * @param {*} primitiveId 
     */
    buildMenu(primitiveId) {
        this.buildMenuFaces(primitiveId);
        this.buildButtons();
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
        }
        else {
            mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(1.5, -0.5, -4));
            mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(3, 1, 8));
        }

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