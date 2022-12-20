import { Piece } from "./Piece.js";
import { buildPieceComponent } from "./primitives.js";

const GameState = Object.freeze({
    Menu: Symbol("Menu"),
    LoadScene: Symbol("LoadScene"),
    WaitPiecePick: Symbol("WaitPiecePick"),
    WaitTilePick: Symbol("WaitTilePick"),
    Moving: Symbol("Moving"),
    EndGame: Symbol("spring")

})

export class Checkers {
    constructor (scene, mainboard, piecesMaterialsIds) {
        this.scene = scene;
        this.mainboard = mainboard;
        this.pieces = [];
        
        this.game = this.buildInitialGame();
        this.displayGame();
        
        const pieceComponentId = buildPieceComponent(this.scene);
        this.buildPieces(this.game, pieceComponentId, piecesMaterialsIds);

        this.state = GameState.Menu;
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
                pickResults.splice(0, pickResults.length);
            }
        }
    }

    buildInitialGame() {
        const game = new Array(8*8);
        let n = 0;
        for (let v = 0; v < 8; v++) {
            for (let h = 0; h < 8; h++) {
                if ((v + h) % 2 == 0 && (v < 3 || v > 4)) {
                    game[v*8+h] = n++;
                }
                else {
                    game[v*8+h] = -1;
                }
            }
        }
        return game;
    }

    displayGame() {
        for (let v = 0; v < 8; v++) {
            console.log(this.game.slice(v*8, v*8+8).join(" "));
        }
    }

    buildPieces(game, componentref, piecesMaterialsIds) {
        this.pieces = [];
        for (let i = 0; i < game.length; i++) {
            const type = game[i] <= 11? 1:2;
            if (game[i] != -1) {
                const materialId = piecesMaterialsIds[type-1];
                const pickId = game[i] + 200;
                this.pieces.push(new Piece(this.scene, this.mainboard.gameboardTiles[i], type, materialId, componentref, pickId));
            }
        }
    }
}