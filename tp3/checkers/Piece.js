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
    constructor(sceneGraph, tile, materialIds, componentref, pickId) {
        super(pickId);
        this.sceneGraph = sceneGraph;
        this.tile = tile;
        this.idx = pickId-200;
        this.id = `checkers-piece-${this.idx}`;
        this.buildPieceComponent(materialIds, componentref);

        this.tile.piece = this;

        this.pieceOnTop = null;
        this.pieceOnBottom = null;

        this.validTiles = [];
    }

    display() {
        this.registerPickable(this.sceneGraph.scene, this);
        displayGraph(this.sceneGraph, [false, this.id], null);
        this.unregisterPickable(this.sceneGraph.scene);
    }

    /**
     * Add a piece component to the scene graph
     * @param {Array[string]} materialIds First element is the material for the piece, second is the material for the piece when selected
     * @param {*} componentref piece component reference
     */
    buildPieceComponent(materialIds, componentref) {
        const texture = ['none', 1, 1];
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.tile.h, 0, -this.tile.v));
        this.sceneGraph.components[this.id] = new MyComponent(this.sceneGraph.scene, this.id, transfMatrix, materialIds, texture, [[false, componentref]], null, null);
    }

    /**
     * Change material according to selection and highlight valid moves if it is supposed to
     * @param {*} toSelect True to select and false to unselect
     * @returns 
     */
    select(toSelect) {
        const material = toSelect ? 1 : 0;
        this.sceneGraph.components[this.id].material = material;
        if (this.isKing()) {
            this.sceneGraph.components[this.pieceOnTop.id].material = material;
        }

        // Highlight valid moves
        if (toSelect) {
            if (!this.sceneGraph.scene.checkers.showValidMoves) return;
            const validMoves = this.sceneGraph.scene.checkers.ruler.turnValidMoves[this.idx];
            for (const move in validMoves) {
                const tileToHighlightIdx = validMoves[move].toVisit[validMoves[move].toVisit.length-1];
                const tileToHighlight = this.sceneGraph.scene.checkers.mainboard.tiles[tileToHighlightIdx];
                tileToHighlight.highlight(true);
                this.validTiles.push(tileToHighlight);
            }
        } else {
            for (const tile of this.validTiles) {
                tile.highlight(false);
            }
            this.validTiles = [];
        }
    }

    /**
     * Reset all piece properties
     */
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

    /**
     * Handle piece pick
     */
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

    /**
     * Update piece linked tile and the relative transformation.
     * @param {*} tile 
     */
    updateTile(tile) {
        if (this.tile != null)
            this.tile.piece = null;
        this.tile = tile;
        this.tile.piece = this;
        let transfMatrix = mat4.create();
        mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(this.tile.h, 0, -this.tile.v));
        this.sceneGraph.components[this.id].transfMatrix = transfMatrix;
    }

    /**
     * Turn piece into a king piece or a pawn piece.
     * @param {*} toKing If true, the piece will become a king. If false, the piece will become a pawn piece.
     * @param {*} pieceOnTop Piece that will be on top of this piece. Unused if toKing is false.
     */
    becomeKing(toKing, pieceOnTop) {
        if (toKing && !this.isKing()) {
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
            if (this.sceneGraph.components[this.id].children.length > 1)
                this.sceneGraph.components[this.id].children.pop();
            this.pieceOnTop.tile = this.sceneGraph.scene.checkers.auxiliarboard.tiles[this.pieceOnTop.idx-1]
            this.pieceOnTop.tile.piece = this.pieceOnTop;
            this.pieceOnTop.pieceOnBottom = null;
            this.pieceOnTop = null;
        }
    }

    isKing() {
        return this.pieceOnTop != null;
    }

}