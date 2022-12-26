import { MyComponent } from '../components/MyComponent.js';
import { displayGraph } from './utils.js';
import { Pickable } from './Pickable.js';
import { GameState } from './GameStateMachine.js';

export class Piece extends Pickable {
    /**
     * 
     * @param {*} sceneGraph 
     * @param {*} tile 
     * @param {*} materialId 
     * @param {*} componentref 
     * @param {*} pickId 
     */
    constructor(sceneGraph, tile, materialId, componentref, pickId) {
        super(pickId);
        this.sceneGraph = sceneGraph;
        this.tile = tile;
        this.idx = pickId-200;
        this.id = `checkers-piece-${this.idx}`;
        this.buildPieceComponent(materialId, componentref);

        this.tile.piece = this;

        this.pieceOnTop = null;
        this.pieceOnBottom = null;
    }

    display() {
        this.registerPickable(this.sceneGraph.scene, this);
        displayGraph(this.sceneGraph, [false, this.id], null);
        this.unregisterPickable(this.sceneGraph.scene);
    }

    buildPieceComponent(materialId, componentref) {
        const texture = ['none', 1, 1];
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.tile.h, 0, -this.tile.v));
        this.sceneGraph.components[this.id] = new MyComponent(this.sceneGraph.scene, this.id, transfMatrix, [materialId, 'white'], texture, [[false, componentref]], null, null);
    }

    onPick() {
        console.log(`Selected piece: ${this.idx}`);
        const checkers = this.sceneGraph.scene.checkers;
        if (checkers.selectedPieceIdx != null) {
            checkers.unselectPiece();
            checkers.setState(GameState.WaitPiecePick);
        } else {
            checkers.selectPiece(this.idx);
            checkers.setState(GameState.WaitTilePick);
        }
    }

    updateTile(tile) {
        this.tile.piece = null;
        this.tile = tile;
        this.tile.piece = this;
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.tile.h, 0, -this.tile.v));
        this.sceneGraph.components[this.id].transfMatrix = transfMatrix;
    }

    becomeKing(toKing, pieceOnTop) {
        if (toKing) {
            console.log("Becoming king")
            this.pieceOnTop = pieceOnTop;
            pieceOnTop.pieceOnBottom = this;
            pieceOnTop.tile.piece = null;
            pieceOnTop.tile = null;
            if (this.sceneGraph.components[this.id].children.length == 1) {
                this.sceneGraph.components[this.id].children.push([false, pieceOnTop.id]);
            }
            let tm = mat4.create();
            mat4.translate(tm, tm, vec3.fromValues(0, 0.3, 0));
            this.sceneGraph.components[pieceOnTop.id].transfMatrix = tm;
        } else {
            console.log("Becoming not king")
            if (this.sceneGraph.components[this.id].children.length > 1)
                this.sceneGraph.components[this.id].children.pop();
            this.pieceOnTop.pieceOnBottom = null;
            this.pieceOnTop = null;
        }
    }

    isKing() {
        return this.pieceOnTop != null;
    }

}