import { MyComponent } from "../components/MyComponent.js";
import { Pickable } from "./Pickable.js";
import { displayGraph } from "./utils.js";
import { GameState } from "./Checkers.js";
import { CurrentPlayer } from "./GameRuler.js";


export class GameboardTile extends Pickable {
    constructor(sceneGraph, board, h, v, primitiveId, materialId, pickId) {
        super(pickId);
        this.sceneGraph = sceneGraph;
        this.board = board;
        this.idx = h + v * 8;
        this.id = `checkers-tile-${this.idx}`;
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
        const piecesToKill = checkers.ruler.validateMove(this.idx);
        if (piecesToKill == null) return null;
        
        /*const piece = checkers.pieces[checkers.selectedPieceId];
        checkers.changeState(GameState.Moving);
        checkers.movePiece(piece, piece.tile, this);*/

        const prevTileId = checkers.game.indexOf(checkers.selectedPieceId);
        checkers.game[this.idx] = checkers.game[prevTileId];
        checkers.game[prevTileId] = -1;
        piecesToKill.forEach(pieceId => {
            checkers.game[checkers.game.indexOf(pieceId)] = -1;
        });

        if (checkers.turn == CurrentPlayer.P1 && this.idx >= 56 || checkers.turn == CurrentPlayer.P2 && this.idx <= 7) {
            checkers.pieces[checkers.selectedPieceId].becomeKing(true);
        }

        checkers.unselectPiece();
        checkers.updateMainboard();
        checkers.turn = checkers.turn == CurrentPlayer.P1 ? CurrentPlayer.P2 : CurrentPlayer.P1;
        checkers.changeState(GameState.WaitPiecePick);
    }
}