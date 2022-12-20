import { Piece } from "./Piece.js";
import { buildPieceComponent } from "./primitives.js";
import { CGFscene } from "../../lib/CGF.js";
import { encode } from "./utils.js";

export class Checkers {
    constructor (scene, mainboard, piecesMaterialsIds) {
        this.scene = scene;
        this.mainboard = mainboard;
        this.pieces = [];
        const pieceComponentId = buildPieceComponent(this.scene);
        this.buildPieces(pieceComponentId, piecesMaterialsIds, 1);
        this.buildPieces(pieceComponentId, piecesMaterialsIds, 2);
    }

    display() {
        // TODO: test purposes only
        for (let piece of this.pieces) {
            this.scene.scene.registerForPick(encode(piece.id), piece);
        }
        this.mainboard.display();
    }

    buildPieces(componentref, piecesMaterialsIds, type) {
        if (type !== 1 && type !== 2) return;
        const isType1 = type == 1;
        const materialId = piecesMaterialsIds[type-1];
        let n = 0;
        for (let i = isType1? 0:7 ; isType1? i<8:i>-1; isType1? i++:i--) {
            for (let j = isType1? 0:7 ; isType1? j<8:j>-1; isType1? j++:j--) {
                if (n == 12) return;
                const isDarkTile = (i + j) % 2 == 0;
                if (isDarkTile) {
                    this.pieces.push(new Piece(this.scene, this.mainboard.gameboardTiles[i*8+j], type, materialId, componentref));
                    n++;
                }
            }
        }
    }
}