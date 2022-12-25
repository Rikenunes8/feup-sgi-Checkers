import { MyComponent } from '../components/MyComponent.js';
import { displayGraph } from './utils.js';
import { Pickable } from './Pickable.js';
import { GameState } from './GameStateMachine.js';

export class Piece extends Pickable {
    /**
     * 
     * @param {*} sceneGraph 
     * @param {*} tile 
     * @param {boolean} isKing P for pawn or K for king
     * @param {*} materialId 
     * @param {*} componentref 
     * @param {*} pickId 
     */
    constructor(sceneGraph, tile, isKing, materialId, componentref, pickId) {
        super(pickId);
        this.sceneGraph = sceneGraph;
        this.tile = tile;
        this.isKing = isKing;
        this.idx = pickId-200;
        this.id = `checkers-piece-${this.idx}`;
        this.buildPieceComponent(materialId, componentref);

        this.tile.piece = this;
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

    becomeKing(toKing) {
        this.isKing = toKing;
        //this.sceneGraph.components[this.id].children[0][1] = toKing ? this.componentrefs[1] : this.componentrefs[0];
    }

}