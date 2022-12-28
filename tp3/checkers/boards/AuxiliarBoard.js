import { MyComponent } from "../../components/MyComponent.js";
import { displayGraph } from "../utils.js";
import { writeText } from "../../text/text.js";
import { buildCheckersTile } from "../primitives.js";
import { Board } from "./Board.js";
import { Tile } from "../Tile.js";

export class AuxiliarBoard extends Board {
    constructor(sceneGraph, p1, p2, boardWallsMaterialId, buttonsMaterialId, lightTileMaterialId, darkTileMaterialId) {
        super(sceneGraph, 'checkers-auxiliarboard', p1, p2, lightTileMaterialId, darkTileMaterialId, boardWallsMaterialId);

        this.buildBoard();
    }

    getFirstPieceOfPlayer(player) {
        for (const tile of this.tiles) {
            if (tile.piece != null && this.sceneGraph.scene.checkers.ruler.belongsToPlayer(tile.piece.idx, player)) {
                return tile.piece;
            }
        }
        return null;
    }

    buildBoard() {
        this.transfMatrix = this.buildBoardTransfMatrix();
        this.facesIds = [];
        this.tiles = [];

        const rectangleId = buildCheckersTile(this.sceneGraph);
        this.buildFaces(rectangleId);
        this.buildMenu(rectangleId);
        this.buildBoardBase();
        this.buildTiles(rectangleId);
    }

    /**
     * Builds tiles with 12 pieces for each player
     * @param {*} primitiveId 
     * @param {*} lightTileMaterialId 
     * @param {*} darkTileMaterialId 
     */
    buildTiles(primitiveId) {
        for (let v = 0; v < 8; v++) {
            for (let h = 0; h < 3; h++) {
                const tileMaterial = (v + h) % 2 != 0 ? this.lightTileMaterialId : this.darkTileMaterialId;
                const pickId = (v * 3) + h + 300;
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
        const [p1Score, p2Score] = scene.checkers.getScores();

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
        writeText(scene, 'Score:' + p2Score);
        scene.popMatrix();

        // Draw player2 Curr Time
        scene.pushMatrix();
        transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(3 - 0.01, 2.5, -6.8));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(0.3, 0.5, 1));
        scene.multMatrix(transfMatrix);
        writeText(scene, 'Curr Time:' + scene.checkers.results.p2CurrTime + 's');
        scene.popMatrix();

        // Draw player2 Total Time
        scene.pushMatrix();
        transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(3 - 0.01, 1.8, -6.9));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(0.3, 0.5, 1));
        scene.multMatrix(transfMatrix);
        writeText(scene, 'Total Time:' + scene.checkers.results.p2Time + 's');
        scene.popMatrix();


        // Draw player1 Score
        scene.pushMatrix();
        transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(3 - 0.01, 3.2, -2.7));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(0.3, 0.5, 1));
        scene.multMatrix(transfMatrix);
        writeText(scene, 'Score:' + p1Score);
        scene.popMatrix();

        // Draw player1 Time
        scene.pushMatrix();
        transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(3 - 0.01, 2.5, -3.1));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(0.3, 0.5, 1));
        scene.multMatrix(transfMatrix);
        writeText(scene, 'Curr Time:' + scene.checkers.results.p1CurrTime + 's');
        scene.popMatrix();

        // Draw player1 Time
        scene.pushMatrix();
        transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(3 - 0.01, 1.8, -3.2));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(0.3, 0.5, 1));
        scene.multMatrix(transfMatrix);
        writeText(scene, 'Total Time:' + scene.checkers.results.p1Time + 's');
        scene.popMatrix();

        // Draw Total Time
        scene.pushMatrix();
        transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(3 - 0.01, 0.8, -5.7));
        mat4.rotateY(transfMatrix, transfMatrix, -Math.PI / 2);
        mat4.scale(transfMatrix, transfMatrix, vec3.fromValues(0.3, 0.5, 1));
        scene.multMatrix(transfMatrix);
        writeText(scene, 'Total Game Time:' + scene.checkers.results.totalTime + 's');
        scene.popMatrix();
    }

    /**
     * Builds the menu of the board
     * @param {*} primitiveId 
     */
    buildMenu(primitiveId) {
        this.buildMenuFaces(primitiveId);
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