import { Piece } from "./Piece.js";
import { buildPieceComponent } from "./primitives.js";
import { GameRuler, CurrentPlayer, emptyTile } from "./GameRuler.js";
import { GameStateMachine, GameState } from "./GameStateMachine.js";
import { PieceAnimator } from "./PieceAnimator.js";
import { GameSequence } from "./GameSequence.js";
import { GameMove } from "./GameMove.js";
import { MainMenu } from './menu/MainMenu.js';
import { Menu } from './menu/Menu.js';
import { MyButton } from "../components/MyButton.js";
import { CGFappearance } from "../../lib/CGF.js";
import { popupAmbient } from "./constants.js";

export class Checkers {
    constructor (sceneGraph, mainboard, auxiliarboard, piecesMaterialsIds) {
        this.sceneGraph = sceneGraph;
        
        this.mainMenu = new MainMenu(this.sceneGraph.scene, [0, 0], [10, 10]);
        this.menu = new Menu(this.sceneGraph.scene);

        this.mainboard = mainboard;
        this.auxiliarboard = auxiliarboard;
        this.ruler = new GameRuler(this);
        this.stateMachine = new GameStateMachine(this);
        this.pieceAnimator = new PieceAnimator(this.sceneGraph);
        this.pieces = [];
        
        this.game = this.ruler.buildInitialGame();
        this.sequence = new GameSequence(this.game);
        
        const pieceComponentsIds = buildPieceComponent(this.sceneGraph);
        this.buildPieces(this.game, pieceComponentsIds, piecesMaterialsIds);

        this.turn = CurrentPlayer.P1;
        this.selectedPieceIdx = null;
        this.setState(GameState.Menu);
        this.interval = setInterval(this.updateTime, 1000);

        this.config = {
            selectedTheme: 1,
            playerMaxTime: 20,
            gameMaxTime: 2,
        }

        this.invalidMove = {
            showInvalidMove: false,
            popup: new MyButton(this.sceneGraph.scene, 'checkers-invalid-popup', [20, -80], [35, -70], true, 3000, this.initBtnOnPick, 'Inválid Move', [28, -17, -50]),
            appearance: new CGFappearance(this.sceneGraph.scene),
        }
		this.invalidMove.appearance.setAmbient(popupAmbient[0], popupAmbient[1], popupAmbient[2], popupAmbient[3]);

        this.results = {
            p1Time: 0,
            p2Time: 0,
            totalTime: 0,
        }
    }

    /**
     * Updates the time of each player and total
     * time of the Game
     */
    updateTime = () => {
        // TODO Check if game already initialized using GameStateMachine probably
        // reset these times when game ends and we click init game again
        const currentState = this.stateMachine.getState();
        if (currentState != GameState.Menu 
            && currentState != GameState.EndGame 
            && currentState != GameState.Pause) {
            
            this.results.totalTime += 1;
            if (this.turn == CurrentPlayer.P1) {
                this.results.p1Time += 1;
            } else {   
                this.results.p2Time += 1;
            }
        }
    }

    /**
     * Update the checkers game on moving state
     * Update the piece animations
     * Check for colisions with other pieces
     * @param {*} time 
     */
    update(time) {
        if (this.stateMachine.getState() == GameState.Moving) {
            // animate piece movement (collector and collected pieces)
            if (this.pieceAnimator.update(time)) {
                const prevTileIdx = this.getTileIdx(this.selectedPieceIdx);
                const tileIdx = this.getPiece(this.selectedPieceIdx).tile.idx;
                this.game[tileIdx] = this.game[prevTileIdx];
                this.game[prevTileIdx] = emptyTile;


                if (this.ruler.becomeKing(tileIdx, this.turn)) {
                    this.getPiece(this.selectedPieceIdx).becomeKing(true);
                }

                this.unselectPiece();
                this.turn = this.turn == CurrentPlayer.P1 ? CurrentPlayer.P2 : CurrentPlayer.P1;
                if (this.ruler.checkEndGame(this.game, this.turn))
                    this.setState(GameState.EndGame);
                else
                    this.setState(GameState.WaitPiecePick);
            }

            // check for colision with other pieces
            for (let i = 0; i < this.pieces.length; i++) {
                if (i != this.selectedPieceIdx-1) {
                    const piece = this.pieces[i];
                    if (this.getTileIdx(piece.idx) != -1 && this.pieceAnimator.checkCollision(piece)) {
                        console.log("Collision with piece " + i);
                        const prevTileIdx = this.getTileIdx(piece.idx);
                        this.game[prevTileIdx] = emptyTile;
                        const auxTile = this.auxiliarboard.tiles[piece.idx-1];
                        const prevTilePos = [piece.tile.h, 0, -piece.tile.v];
                        
                        // calculate the relative position of the auxiliar tile
                        let auxiliarTileRelativePosition = vec3.create();
                        let tm = mat4.create();
                        mat4.invert(tm, this.sceneGraph.components[this.mainboard.id].transfMatrix);
                        mat4.multiply(tm, tm, this.sceneGraph.components[this.auxiliarboard.id].transfMatrix);
                        mat4.translate(tm, tm, vec3.fromValues(auxTile.h, 0, -auxTile.v));
                        vec3.transformMat4(auxiliarTileRelativePosition, vec3.fromValues(0, 0, 0), tm);
                        
                        const nextTilePoss = [auxiliarTileRelativePosition];
                        this.pieceAnimator.addPiece(piece, prevTilePos, nextTilePoss, auxTile, true, time);
                        break;
                    }
                }
            }
        }
    }

    /**
     * Change the game state.
     * @param {GameState} state 
     */
    setState(state) {
        this.stateMachine.changeState(state);
    }

    /**
     * Select a piece. Change its material.
     * @param {int} idx 
     */
    selectPiece(idx) {
        this.selectedPieceIdx = idx;
        this.sceneGraph.components[this.getPiece(this.selectedPieceIdx).id].material = 1;
    }

    /**
     * Unselect the selected piece. Return to original material.
     */
    unselectPiece() {
        if (this.selectedPieceIdx == null) return;
        this.sceneGraph.components[this.getPiece(this.selectedPieceIdx).id].material = 0;
        this.selectedPieceIdx = null;
    }

    /**
     * Displays the checkers game.
     */
    display() {
        if (this.stateMachine.getState() == GameState.Menu) {
            this.mainMenu.display();            
        }
        else {
            this.menu.display();
            this.mainboard.display();
            this.auxiliarboard.display();
            this.displayPopUp();
        }
        
    }

    /**
     * Function to change the display state of the popup.
     */
    changePopupState = (visible) => {
        this.invalidMove.showInvalidMove = visible;
    }

    /**
     * Displays Popup for invalid move.
     */
    displayPopUp() {
        if (this.invalidMove.showInvalidMove) {
            const scene = this.sceneGraph.scene;

            scene.pushMatrix();
            scene.gl.disable(scene.gl.DEPTH_TEST);

            this.invalidMove.appearance.apply();
            scene.loadIdentity();
            scene.scale(1.4, 0.3, 1);
            scene.translate(-5, 18, -50);
            this.invalidMove.popup.display();
            
            scene.gl.enable(scene.gl.DEPTH_TEST);
            scene.popMatrix();
        }
    }

    /**
     * Start piece movement animation.
     * @param {Piece} piece Piece to animate.
     * @param {Tile} prevTile Start tile
     * @param {Array[Tile]} nextTiles Tiles to visit
     */
    movePiece(piece, prevTile, nextTiles) {
        // Put piece color to original
        this.sceneGraph.components[piece.id].material = 0;
        
        const newGameMove = new GameMove(piece, prevTile, nextTiles, this.game);
        this.sequence.addMove(newGameMove);
        this.sequence.topMove().animate(this.pieceAnimator);
    }

    /**
     * Get the entity Piece from the piece idx.
     * @param {*} idx 
     * @returns 
     */
    getPiece(idx) {
        return this.pieces[Math.abs(idx)-1];
    }

    /**
     * Get the tile idx where the piece is or -1 if the piece is not in the game.
     * @param {int} pieceIdx Idx of the piece to get the tile idx.
     * @returns Index of the tile where the piece is. The piece may be a pawn or a king (pieceIdx positive or negative).
     */
    getTileIdx(pieceIdx) {
        let idx = this.game.indexOf(pieceIdx);
        if (idx == -1) 
            idx = this.game.indexOf(-pieceIdx);
        return idx;
    }

    /**
     * Build the pieces for the game from the game matrix.
     * @param {Array} game An array of 64 elements, representing the game board.
     * @param {string} componentref Component that represents a piece.
     * @param {Array} piecesMaterialsIds Array of materials ids for the pieces. The first element is the material for player 1 pieces, and the second is for player 2 pieces.
     */
    buildPieces(game, componentrefs, piecesMaterialsIds) {
        this.pieces = [];
        for (let i = 0; i < game.length; i++) {
            if (game[i] != emptyTile) {
                const type = this.ruler.belongsToPlayer(game[i], CurrentPlayer.P1) ? 0:1;
                const materialId = piecesMaterialsIds[type];
                const pickId = game[i] + 200;
                this.pieces.push(new Piece(this.sceneGraph, this.mainboard.tiles[i], false, materialId, componentrefs, pickId));
            }
        }
    }

    // TODO: remove this function
    printGame() {
        for (let v = 0; v < 8; v++) {
            console.log(this.game.slice(v*8, v*8+8).join(" "));
        }
    }

    /**
     * @returns {boolean} True if the game is running (pause not included), false otherwise.
     */
    isGameRunning() {
        return this.stateMachine.getState() != GameState.Menu 
            && this.stateMachine.getState() != GameState.Pause
            && this.stateMachine.getState() != GameState.EndGame;
    }

    forceGameUpdate() {
        this.game = [...this.sequence.topMove().gameboard];
        for (let piece of this.pieces) {
            const tileIdx = this.getTileIdx(piece.idx);
            if (tileIdx == -1) {
                piece.updateTile(this.auxiliarboard.tiles[piece.idx-1]);
            }
            else {
                piece.updateTile(this.mainboard.tiles[tileIdx]);
            }
        }

    }


    // ****************** Button Handlers ******************

    goToSceneBtnHandler() {
        this.setState(GameState.Pause);
    }

    initBtnHandler() {
        const currentState = this.stateMachine.getState();
        if (currentState == GameState.Pause) {
            this.setState(GameState.WaitPiecePick);
        } else {
            this.setState(GameState.Pause);
        }
    }

    undoBtnHandler() {
        if (this.sequence.isEmpty()) return;
        this.unselectPiece();
        this.forceGameUpdate();
        this.turn = this.turn == CurrentPlayer.P1 ? CurrentPlayer.P2 : CurrentPlayer.P1;
        this.sequence.undo();
        this.setState(GameState.WaitPiecePick);
    }

    mainMenuBtnHandler() {
        this.setState(GameState.Menu);
    }
}