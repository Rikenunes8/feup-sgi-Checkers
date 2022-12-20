import { Piece } from "./Piece.js";
import { buildPieceComponent } from "./primitives.js";

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
        this.mainboard.display();
    }

    onObjectSelected(obj, customId) {
        console.log(`Selected object: ${obj.id}, with pick id ${customId}`);
        /*const encoded = encode(customId);
        if (encoded >= 0) {
            const type = Math.floor(encoded / 100);
            const id = encoded % 100;
            if (type == 1) {
                this.mainboard.selectTile(id);
            }
            else if (type == 2) {
                this.mainboard.selectPiece(id);
            }
        }*/
    }

    managePick(pickMode, pickResults) {
        if (pickMode == false) {
            if (pickResults != null && pickResults.length > 0) {
                for (let i=0; i< pickResults.length; i++) {
                    const obj = pickResults[i][0];
                    if (obj) {
                        const customId = pickResults[i][1];
                        this.onObjectSelected(obj, customId);
                    }
                }
                pickResults.splice(0,pickResults.length);
            }
        }
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