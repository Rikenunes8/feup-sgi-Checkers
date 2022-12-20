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

    // TODO remove this function
    onObjectSelected(obj, customId) {
        console.log(`Selected object: ${obj.id}, with pick id ${customId}`);
        if (customId >= 0) {
            const type = Math.floor(customId / 100);
            const id = customId % 100;
            if (type == 1) {
                console.log(`Selected tile: ${id}`);
                //this.mainboard.selectTile(id);
            }
            else if (type == 2) {
                console.log(`Selected piece: ${id}`);
                //this.mainboard.selectPiece(id);
            }
        }
    }

    managePick(pickMode, pickResults) {
        if (pickMode == false) {
            if (pickResults != null && pickResults.length > 0) {
                for (let i = 0; i < pickResults.length; i++) {
                    const obj = pickResults[i][0];
                    if (obj) {
                        //const customId = pickResults[i][1];
                        //this.onObjectSelected(obj, customId);
                        obj.onPick();
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
        for (let v = isType1? 0:7 ; isType1? v<8:v>-1; isType1? v++:v--) {
            for (let h = isType1? 0:7 ; isType1? h<8:h>-1; isType1? h++:h--) {
                if (n == 12) return;
                const isDarkTile = (v + h) % 2 == 0;
                if (isDarkTile) {
                    const pickId = this.pieces.length + 200;
                    this.pieces.push(new Piece(this.scene, this.mainboard.gameboardTiles[v*8+h], type, materialId, componentref, pickId));
                    n++;
                }
            }
        }
    }
}