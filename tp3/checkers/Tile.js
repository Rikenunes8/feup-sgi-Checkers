import { MyComponent } from "../components/MyComponent.js";
import { Pickable } from "./Pickable.js";
import { displayGraph } from "./utils.js";
import { GameState } from "./GameStateMachine.js";
import { popupTime } from "./constants.js";

export class Tile extends Pickable {
    constructor(sceneGraph, board, h, v, primitiveId, materialId, pickId) {
        super(pickId);
        this.sceneGraph = sceneGraph;
        this.board = board;
        this.idx = h + v * 8;
        this.id = `checkers-tile-${pickId}`;
        this.h = h;
        this.v = v;
        this.buildTile(primitiveId, materialId);
        this.piece = null;
    }

    display() {
        this.registerPickable(this.sceneGraph.scene, this);//, this.sceneGraph.components[this.id]);
        displayGraph(this.sceneGraph, [false, this.id], null);
        this.unregisterPickable(this.sceneGraph.scene);

        if (this.piece) {
            this.piece.display();
        }
    }

    buildTile(primitiveId, materialId) {
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.h, 0, -this.v));
        mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
        let tileTexture = ['none', 1, 1];
        this.sceneGraph.components[this.id] = new MyComponent(this.sceneGraph.scene, this.id, transfMatrix, [materialId], tileTexture, [[true, primitiveId]], null, null);
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

}