import { MyComponent } from "../components/MyComponent.js";
import { Pickable } from "./Pickable.js";
import { displayGraph } from "./utils.js";
import { GameState } from "./GameStateMachine.js";
import { popupTime } from "./constants.js";
import { AuxiliarBoard } from "./boards/AuxiliarBoard.js";
import { GameBoard } from "./boards/GameBoard.js";

export class Tile extends Pickable {
    constructor(sceneGraph, board, h, v, primitiveId, materialId, pickId, highlightMaterialId) {
        super(pickId);
        this.sceneGraph = sceneGraph;
        this.board = board;
        this.idx = pickId % 100;
        this.id = `checkers-tile-${pickId}`;
        this.h = h;
        this.v = v;
        this.buildTile(primitiveId, materialId, highlightMaterialId);
        this.piece = null;
    }

    display() {
        this.registerPickable(this.sceneGraph.scene, this);
        displayGraph(this.sceneGraph, [false, this.id], null);
        this.unregisterPickable(this.sceneGraph.scene);

        if (this.piece) {
            this.piece.display();
        }
    }

    buildTile(primitiveId, materialId, highlightMaterialId) {
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.h, 0, -this.v));
        mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
        let tileTexture = ['none', 1, 1];
        this.sceneGraph.components[this.id] = new MyComponent(this.sceneGraph.scene, this.id, transfMatrix, [materialId, highlightMaterialId], tileTexture, [[true, primitiveId]], null, null);
    }

    onPick() {
        console.log(`Selected tile: ${this.idx}`);
        const checkers = this.sceneGraph.scene.checkers;
        const tilesIdxToVisit = checkers.ruler.validateMove(this.idx);

        if (tilesIdxToVisit == null) {
            checkers.changePopupState(true);
            setTimeout(() => { checkers.changePopupState(false) }, popupTime);
            return null;
        }
        
        const piece = checkers.getPiece(checkers.selectedPieceIdx);
        checkers.setState(GameState.Moving);
        const tilesToVisit = tilesIdxToVisit.map(tileIdx => checkers.mainboard.tiles[tileIdx]);
        checkers.movePiece(piece, piece.tile, tilesToVisit);
    }

    highlight(toHighlight) {
        this.sceneGraph.components[this.id].material = toHighlight ? 1 : 0;
    }

    isGameTile() {
        return this.board instanceof GameBoard;
    }

    isAuxiliarTile() {
        return this.board instanceof AuxiliarBoard;
    }

}