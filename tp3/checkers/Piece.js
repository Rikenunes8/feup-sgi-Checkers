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

    select(toSelect) {
        const material = toSelect ? 1 : 0;
        this.sceneGraph.components[this.id].material = material;
        if (this.isKing()) {
            this.sceneGraph.components[this.pieceOnTop.id].material = material;
        }
    }

    reset() {
        if (this.pieceOnTop != null) {
            this.pieceOnTop.pieceOnBottom = null;
            this.pieceOnTop = null;
        }
        if (this.pieceOnBottom != null) {
            this.pieceOnBottom.pieceOnTop = null;
            this.pieceOnBottom = null;
        }
        if (this.tile != null) {
            this.tile.piece = null;
            this.tile = null;
        }
        this.sceneGraph.components[this.id].children.splice(1);
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
        if (this.tile != null)
            this.tile.piece = null;
        this.tile = tile;
        this.tile.piece = this;
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.tile.h, 0, -this.tile.v));
        this.sceneGraph.components[this.id].transfMatrix = transfMatrix;
    }

    becomeKing(toKing, pieceOnTop) {
        if (toKing && !this.isKing()) {
            console.log("Becoming king")
            this.pieceOnTop = pieceOnTop;
            this.pieceOnTop.pieceOnBottom = this;
            this.pieceOnTop.tile.piece = null;
            this.pieceOnTop.tile = null;
            if (this.sceneGraph.components[this.id].children.length == 1) {
                this.sceneGraph.components[this.id].children.push([false, this.pieceOnTop.id]);
            }
            let tm = mat4.create();
            mat4.translate(tm, tm, vec3.fromValues(0, 0.3, 0));
            this.sceneGraph.components[this.pieceOnTop.id].transfMatrix = tm;
        } else if (!toKing && this.isKing()) {
            console.log("Becoming not king")
            if (this.sceneGraph.components[this.id].children.length > 1)
                this.sceneGraph.components[this.id].children.pop();
            this.pieceOnTop.tile = this.sceneGraph.scene.checkers.auxiliarboard.tiles[this.pieceOnTop.idx-1]
            this.pieceOnTop.tile.piece = this.pieceOnTop;
            this.pieceOnTop.pieceOnBottom = null;
            this.pieceOnTop = null;
        } else {
            console.log("No change in king status")
        }
    }

    isKing() {
        return this.pieceOnTop != null;
    }

}