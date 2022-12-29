import { MyComponent } from "../../components/MyComponent.js";
import { displayGraph } from "../utils.js";
import { buildCheckersTile } from "../primitives.js";
import { Board } from "./Board.js";
import { Tile } from "../Tile.js";
import { TextBlock } from "../../text/TextBlock.js";


export class AuxiliarBoard extends Board {
    constructor(sceneGraph, p1, p2, boardWallsMaterialId, lightTileMaterialId, darkTileMaterialId, fontColor) {
        super(sceneGraph, 'checkers-auxiliarboard', p1, p2, lightTileMaterialId, darkTileMaterialId, boardWallsMaterialId);
        this.fontColor = fontColor;
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

    update(time) {
        this._setUpDisplayResults();
    }

    _setUpDisplayResults() {
        const scene = this.sceneGraph.scene;
        const [p1Score, p2Score] = scene.checkers.getScores();
        this.player1Score.setText('Score:' + p1Score);
        this.player2Score.setText('Score:' + p2Score);

        this.player1TurnTime.setText('Turn Time:' + scene.checkers.results.p1CurrTime + 's');
        this.player2TurnTime.setText('Turn Time:' + scene.checkers.results.p2CurrTime + 's');

        this.player1TotalTime.setText('Total Time:' + scene.checkers.results.p1Time + 's');
        this.player2TotalTime.setText('Total Time:' + scene.checkers.results.p2Time + 's');

        this.totalGameTime.setText('Total Game Time:' + scene.checkers.results.totalTime + 's');

    }

    display() {
        displayGraph(this.sceneGraph, [false, this.id], null);
        const scene = this.sceneGraph.scene;

        scene.pushMatrix();
        scene.multMatrix(this.transfMatrix);
        this.tiles.forEach((tile) => tile.display());
        this._displayResults();
        scene.popMatrix();
    }

    _displayResults() {
        this.sceneGraph.scene.translate(3 - 0.01, 2.75, -4);
        this.sceneGraph.scene.rotate(-Math.PI / 2, 0, 1, 0);
        this.sceneGraph.scene.scale(0.16, 0.2, 1);
        this.texts.forEach((text) => text.display(this.fontColor));
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

    /**
     * Builds tiles with 12 pieces for each player
     * @param {*} primitiveId 
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
     * Builds the menu of the board
     * @param {*} primitiveId 
     */
    buildMenu(primitiveId) {
        this.buildMenuFaces(primitiveId);
        this.buildMenuText();
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
     * Builds the TextBlocks of the auxiliar board
     */
    buildMenuText() {
        const textHeight = 1.5;

        this.player1Name = new TextBlock(this.sceneGraph.scene, 'PLAYER 1', 'center', [-6, 3], 12, textHeight);
        this.player2Name = new TextBlock(this.sceneGraph.scene, 'PLAYER 2', 'center', [6.5, 3], 12, textHeight);
        this.player1Score = new TextBlock(this.sceneGraph.scene, '', 'center', [-6, 0.5], 12, textHeight);
        this.player2Score = new TextBlock(this.sceneGraph.scene, '', 'center', [6.5, 0.5], 12, textHeight);
        this.player1TurnTime = new TextBlock(this.sceneGraph.scene, '', 'center', [-6, -1], 12, textHeight);
        this.player2TurnTime = new TextBlock(this.sceneGraph.scene, '', 'center', [6.5, -1], 12, textHeight);
        this.player1TotalTime = new TextBlock(this.sceneGraph.scene, '', 'center', [-6, -2.5], 12, textHeight);
        this.player2TotalTime = new TextBlock(this.sceneGraph.scene, '', 'center', [6.5, -2.5], 12, textHeight);

        this.totalGameTime = new TextBlock(this.sceneGraph.scene, '', 'center', [0, -5], 14, textHeight);

        this.textsP1 = [this.player1Name, this.player1Score, this.player1TurnTime, this.player1TotalTime];
        this.textsP2 = [this.player2Name, this.player2Score, this.player2TurnTime, this.player2TotalTime];
        this.texts = [...this.textsP1, ...this.textsP2, this.totalGameTime];
    }

    /**
     * Builds a face of the Menu
     * @param {*} primitiveId 
     * @param {*} side
     * @param {*} isMenu Wall of the board or the acctual board
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