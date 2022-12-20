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
        this.buildPiecesType1(pieceComponentId, piecesMaterialsIds[0]);
        this.buildPiecesType2(pieceComponentId, piecesMaterialsIds[1]);
    }

    display() {
        // TODO: test purposes only
        for (let piece of this.pieces) {
            this.scene.scene.registerForPick(encode(piece.id), piece);
        }
        this.mainboard.display();
    }


    buildPiecesType1(componentref, materialId) {
        let n = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (n == 12) return;
                const isDarkTile = (i + j) % 2 == 0;
                if (isDarkTile) {
                    this.pieces.push(new Piece(this.scene, this.mainboard.gameboardTiles[i*8+j], 1, materialId, componentref));
                    n++;
                }
            }
        }
    }
    buildPiecesType2(componentref, materialId) {
        let n = 0;
        for (let i = 7; i > -1; i--) {
            for (let j = 7; j > -1; j--) {
                if (n == 12) return;
                const isDarkTile = (i + j) % 2 == 0;
                if (isDarkTile) {
                    this.pieces.push(new Piece(this.scene, this.mainboard.gameboardTiles[i*8+j], 2, materialId, componentref));
                    n++;
                }
            }
        }
    }
}