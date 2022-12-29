import { Piece } from "./Piece.js";
import { buildPieceComponent } from "./primitives.js";
import { GameRuler, CurrentPlayer, emptyTile } from "./GameRuler.js";
import { GameStateMachine, GameState } from "./GameStateMachine.js";
import { AnimationType, PieceAnimator } from "./PieceAnimator.js";
import { GameSequence } from "./GameSequence.js";
import { GameMove } from "./GameMove.js";
import { MainMenu } from './menu/MainMenu.js';
import { SceneMenu } from './menu/SceneMenu.js';
import { ResultsMenu } from "./menu/ResultsMenu.js";
import { AnimationCamera } from "./AnimationCamera.js";
import { Popup } from "./menu/Popup.js";

export class Checkers {
    /**
     * 
     * @param {*} sceneGraph 
     * @param {*} mainboard 
     * @param {*} auxiliarboard 
     * @param {Array} piecesMaterialsIds Array of materials ids for the pieces. The first element is the material for player 1 pieces, and the second is for player 2 pieces.
     */
    constructor (sceneGraph, mainboard, auxiliarboard, piecesMaterialsIds, spotlightHeight) {
        this.sceneGraph = sceneGraph;
        this.showValidMoves = true;
        this.forceEat = true;

        this.mainMenu = new MainMenu(this.sceneGraph.scene);
        this.menu = new SceneMenu(this.sceneGraph.scene);
        this.resultsMenu = new ResultsMenu(this.sceneGraph.scene);
        this.popup = new Popup(this.sceneGraph.scene);

        this.mainboard = mainboard;
        this.auxiliarboard = auxiliarboard;

        this.ruler = new GameRuler(this);
        this.stateMachine = new GameStateMachine(this);
        this.pieceAnimator = new PieceAnimator(this.sceneGraph, spotlightHeight);
        this.pieces = [];

        this.game = this.ruler.buildInitialGame();
        this.sequence = new GameSequence(this.game);

        this.piecesMaterialsIds = piecesMaterialsIds;
        const pieceComponentId = buildPieceComponent(this.sceneGraph);
        this.buildPieces(this.game, pieceComponentId);

        this.turn = CurrentPlayer.P1;
        this.selectedPieceIdx = null;
        this.setState(GameState.Menu);
        this.interval = setInterval(this.updateTime, 1000);

        this.config = {
            selectedTheme: 1,
            turnMaxTime: 20,
            playerMaxTime: 2,
        }

        this.results = {
            p1Time: 0,
            p1CurrTime: 0,
            p2Time: 0,
            p2CurrTime: 0,
            totalTime: 0,
            winner: null,
        }

        this.pendingKings = [];

        this.animationCamera = new AnimationCamera();
    }

    /**
     * Resets the game to the initial state.
     * To do so, it builds a new game, a new sequence
     * and resets the turn, selected piece and state.
     */
    resetGame() {

        this.mainboard.buildBoard();
        this.auxiliarboard.buildBoard();

        this.pieces = [];
        this.game = this.ruler.buildInitialGame();
        this.sequence = new GameSequence(this.game);

        const pieceComponentsIds = buildPieceComponent(this.sceneGraph);
        this.buildPieces(this.game, pieceComponentsIds);

        this.turn = CurrentPlayer.P1;
        this.ruler.setValidMoves(this.turn);
        this.selectedPieceIdx = null;
        this.results = {
            p1Time: 0,
            p1CurrTime: 0,
            p2Time: 0,
            p2CurrTime: 0,
            totalTime: 0,
            winner: null,
        }
    }

    /**
     * Updates the time of each player and total
     * time of the Game
     */
    updateTime = () => {
        // TODO Check if game already initialized using GameStateMachine probably
        // reset these times when game ends and we click init game again
        if (this.isGameRunning()) {
            this.results.totalTime += 1;
            if (this.turn == CurrentPlayer.P1) {
                this.results.p1Time += 1;
                this.results.p1CurrTime += 1;
            } else {
                this.results.p2Time += 1;
                this.results.p2CurrTime += 1;
            }

            this.checkTimeLimit();
        }
    }

    /**
     * Checks if the time limit of each player has been reached
     * and ends the game if so.
     */
    checkTimeLimit() {
        // convert to seconds
        const playerMaxTime = this.config.playerMaxTime * 60;
        if (this.results.p1Time > playerMaxTime) {
            this.results.winner = CurrentPlayer.P2;
            this.setState(GameState.EndGame);
        } else if (this.results.p2Time > playerMaxTime) {
            this.results.winner = CurrentPlayer.P1;
            this.setState(GameState.EndGame);
        } else if (this.results.p1CurrTime > this.config.turnMaxTime) {
            this.results.winner = CurrentPlayer.P2;
            this.setState(GameState.EndGame);
        } else if (this.results.p2CurrTime > this.config.turnMaxTime) {
            this.results.winner = CurrentPlayer.P1;
            this.setState(GameState.EndGame);
        }
        
    }
    

    /**
     * Update the checkers game on moving state
     * Update the piece animations
     * Check for colisions with other pieces
     * @param {*} time 
     */
    update(time) {
        if (this.stateMachine.getState() == GameState.Moving || this.stateMachine.getState() == GameState.ReplayMoving) {
            const endedAnimations = this.pieceAnimator.update(time);
            if (endedAnimations) this.endTurn(time);
            this.checkCollisions(time);
        }

        this.animationCamera.update(this.sceneGraph.scene.camera);
    }

    /**
     * End the turn of the current player and prepare the next one
     */
    endTurn(time) {
        const prevTileIdx = this.getTileIdx(this.selectedPieceIdx);
        const tileIdx = this.getPiece(this.selectedPieceIdx).tile.idx;
        this.game[tileIdx] = this.game[prevTileIdx];
        if (tileIdx != prevTileIdx)
            this.game[prevTileIdx] = emptyTile;

        for (let elem of this.pendingKings) {
            const [_tileIdx, _pieceIdx, _player] = elem;
            const pieceToPutOnTop = this.auxiliarboard.getFirstPieceOfPlayer(_player);
            if (pieceToPutOnTop) {
                this.ruler.becomeKing(_tileIdx, true);

                const pieceOnBottom = this.getPiece(_pieceIdx);
                const startPosition = [pieceToPutOnTop.tile.h, 0, -pieceToPutOnTop.tile.v];
                let endPosition = vec3.create();
                let tm = mat4.create();
                mat4.invert(tm, this.sceneGraph.components[this.auxiliarboard.id].transfMatrix);
                mat4.multiply(tm, tm, this.sceneGraph.components[this.mainboard.id].transfMatrix);
                mat4.translate(tm, tm, vec3.fromValues(pieceOnBottom.tile.h, 0.3, -pieceOnBottom.tile.v));
                vec3.transformMat4(endPosition, vec3.fromValues(0, 0, 0), tm);
                
                this.pieceAnimator.addPiece(pieceToPutOnTop, startPosition, [endPosition], pieceOnBottom, AnimationType.KINGIFY, time)
                this.pendingKings.splice(this.pendingKings.indexOf(elem), 1);
                return;
            }
        }

        if (this.ruler.shouldBecomeKing(tileIdx, this.game)) {
            const pieceToPutOnTop = this.auxiliarboard.getFirstPieceOfPlayer(this.turn);
            if (!pieceToPutOnTop) {
                this.pendingKings.push([tileIdx, this.selectedPieceIdx, this.turn]);
            } else {
                this.ruler.becomeKing(tileIdx, true);

                const pieceOnBottom = this.getPiece(this.selectedPieceIdx);
                const startPosition = [pieceToPutOnTop.tile.h, 0, -pieceToPutOnTop.tile.v];
                let endPosition = vec3.create();
                let tm = mat4.create();
                mat4.invert(tm, this.sceneGraph.components[this.auxiliarboard.id].transfMatrix);
                mat4.multiply(tm, tm, this.sceneGraph.components[this.mainboard.id].transfMatrix);
                mat4.translate(tm, tm, vec3.fromValues(pieceOnBottom.tile.h, 0.3, -pieceOnBottom.tile.v));
                vec3.transformMat4(endPosition, vec3.fromValues(0, 0, 0), tm);
                
                this.pieceAnimator.addPiece(pieceToPutOnTop, startPosition, [endPosition], pieceOnBottom, AnimationType.KINGIFY, time)
                return;
            }
        }

        if (this.turn == CurrentPlayer.P1) {
            this.results.p1CurrTime = 0;
        } else {
            this.results.p2CurrTime = 0;
        }

        const turnBefore = this.turn;
        this.unselectPiece();
        this.turn = this.turn == CurrentPlayer.P1 ? CurrentPlayer.P2 : CurrentPlayer.P1;
        this.ruler.setValidMoves(this.turn);
        if (this.ruler.checkEndGame(this.game, this.turn)) {
            this.setState(GameState.EndGame);
        } else if (this.stateMachine.getState() == GameState.Moving) {
            this.animationCamera.rotate(turnBefore, this.sceneGraph.scene.camera);
            this.setState(GameState.WaitPiecePick);
        } else if (this.stateMachine.getState() == GameState.ReplayMoving) {
            this.setState(GameState.Replay);
            this.sequence.replayNextMove(this, this.pieceAnimator);
        }
    }

    /**
     * Check for colision with other pieces and update the game if there is one
     * @param {*} time 
     */
    checkCollisions(time) {
        for (let i = 0; i < this.pieces.length; i++) {
            if (i != this.selectedPieceIdx-1) {
                const piece = this.pieces[i];
                if (this.getTileIdx(piece.idx) != -1 && this.pieceAnimator.checkCollision(piece)) {
                    console.log("Collision with piece " + i);
                    const prevTileIdx = this.getTileIdx(piece.idx);
                    this.game[prevTileIdx] = emptyTile;
                    
                    // calculate the relative position of the auxiliar tile
                    let prevTilePos = vec3.create();
                    let tm = mat4.create();
                    mat4.invert(tm, this.sceneGraph.components[this.auxiliarboard.id].transfMatrix);
                    mat4.multiply(tm, tm, this.sceneGraph.components[this.mainboard.id].transfMatrix);
                    mat4.translate(tm, tm, vec3.fromValues(piece.tile.h, 0, -piece.tile.v));
                    vec3.transformMat4(prevTilePos, vec3.fromValues(0, 0, 0), tm);
                    
                    const auxTile = this.auxiliarboard.tiles[piece.idx-1];
                    const nextTilePoss = [[auxTile.h, 0, -auxTile.v]];

                    if (piece.isKing()) {
                        // calculate the relative position of the auxiliar tile
                        let _prevTilePos = vec3.create();
                        tm = mat4.create();
                        mat4.invert(tm, this.sceneGraph.components[this.auxiliarboard.id].transfMatrix);
                        mat4.multiply(tm, tm, this.sceneGraph.components[this.mainboard.id].transfMatrix);
                        mat4.translate(tm, tm, vec3.fromValues(piece.tile.h, 0.3, -piece.tile.v));
                        vec3.transformMat4(_prevTilePos, vec3.fromValues(0, 0, 0), tm);
                        
                        const pieceOnTop = piece.pieceOnTop;
                        const _auxTile = this.auxiliarboard.tiles[pieceOnTop.idx-1];
                        const _nextTilePoss = [[_auxTile.h, 0, -_auxTile.v]];
                        piece.becomeKing(false);
                        this.pieceAnimator.addPiece(pieceOnTop, _prevTilePos, _nextTilePoss, _auxTile, AnimationType.COLLECTED, time);
                    }

                    this.pieceAnimator.addPiece(piece, prevTilePos, nextTilePoss, auxTile, AnimationType.COLLECTED, time);
                    break;
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
        const selectedPiece = this.getPiece(this.selectedPieceIdx);
        selectedPiece.select(true);
    }

    /**
     * Unselect the selected piece. Return to original material.
     */
    unselectPiece() {
        if (this.selectedPieceIdx == null) return;
        const selectedPiece = this.getPiece(this.selectedPieceIdx);
        selectedPiece.select(false);
        this.selectedPieceIdx = null;
    }

    /**
     * Displays the checkers game.
     */
    display() {

        if (this.stateMachine.getState() == GameState.Menu) {
            this.mainMenu.display();
        } else {
            this.mainboard.display();
            this.auxiliarboard.display();
            this.menu.display();
            if (this.popup.isVisible())
                this.popup.display();
        }

        if (this.stateMachine.getState() == GameState.EndGame)
            this.resultsMenu.display();
    }

    /**
     * Start piece movement animation.
     * @param {Piece} piece Piece to animate.
     * @param {Tile} prevTile Start tile
     * @param {Array[Tile]} nextTiles Tiles to visit
     */
    movePiece(piece, prevTile, nextTiles) {
        // Put piece color to original
        piece.select(false);

        const newGameMove = new GameMove(piece, prevTile, nextTiles, this.game);
        this.sequence.addMove(newGameMove);
        this.sequence.topMove().animate(this.pieceAnimator);
    }

    /**
     * Get the entity Piece from the piece idx.
     * @param {*} idx 
     * @returns {Piece}
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
     */
    buildPieces(game, componentref) {
        this.pieces = [];
        for (let i = 0; i < game.length; i++) {
            if (game[i] != emptyTile) {
                const type = this.ruler.belongsToPlayer(game[i], CurrentPlayer.P1) ? 0:1;
                const materialId = this.piecesMaterialsIds[type];
                const pickId = game[i] + 200;
                this.pieces.push(new Piece(this.sceneGraph, this.mainboard.tiles[i], materialId, componentref, pickId));
            }
        }
    }

    /**
     * @returns {boolean} True if the game is running (pause not included), false otherwise.
     */
    isGameRunning() {
        return this.stateMachine.getState() != GameState.Menu 
            && this.stateMachine.getState() != GameState.Pause
            && this.stateMachine.getState() != GameState.EndGame
            && this.stateMachine.getState() != GameState.Replay
            && this.stateMachine.getState() != GameState.ReplayMoving
            && this.stateMachine.getState() != GameState.Idle;
    }

    /**
     * @returns {boolean} True if the game is in pause, false otherwise.
     */
    isGamePaused() {
        return this.stateMachine.getState() == GameState.Pause;
    }

    forceGameUpdate(gameboard) {
        this.game = [...gameboard];
        this.pendingKings = [];
        
        this.pieces.forEach(piece => piece.reset());
        const collected = this.pieces.filter(piece => this.getTileIdx(piece.idx) == -1);
        const notCollected = this.pieces.filter(piece => this.getTileIdx(piece.idx) != -1);

        collected.forEach(piece => piece.updateTile(this.auxiliarboard.tiles[piece.idx-1]));
        notCollected.forEach(piece => {
            const tileIdx = this.getTileIdx(piece.idx);
            piece.updateTile(this.mainboard.tiles[tileIdx]);
            const currPlayer = this.ruler.getPlayer(piece.idx);
            if (this.ruler.isKing(tileIdx)) {
                const pieceToPutOnTop = this.auxiliarboard.getFirstPieceOfPlayer(currPlayer);
                if (pieceToPutOnTop != null) {
                    piece.becomeKing(true, pieceToPutOnTop);
                } else {
                    this.pendingKings.push([tileIdx, piece.idx, currPlayer]);
                }
            } else {
                if (this.ruler.shouldBecomeKing(tileIdx, this.game)) {
                    this.pendingKings.push([tileIdx, piece.idx, currPlayer]);
                }
            }
        });
    }

    /**
     * Calculates the score of each player.
     * @returns [p1Score, p2Score] -> Array with the score of each player.
     */
    getScores() {
        let p1Count = 0;
        let p2Count = 0;
        for (let pieceIdx of this.game) {
            if (this.ruler.belongsToPlayer(pieceIdx, CurrentPlayer.P1))
                p1Count++;
            else if (this.ruler.belongsToPlayer(pieceIdx, CurrentPlayer.P2))
                p2Count++;
        }

        return [12 - p2Count, 12 - p1Count];
    }


    // ****************** Button Handlers ******************

    goToSceneBtnHandler() {
        this.setState(GameState.Idle);
    }

    resetBtnHandler() {
        this.setState(GameState.Idle);
        this.setState(GameState.WaitPiecePick);
    }

    initBtnHandler() {
        const currentState = this.stateMachine.getState();
        if (currentState == GameState.Pause || currentState == GameState.Idle) {
            this.setState(GameState.WaitPiecePick);
        } else {
            this.setState(GameState.Pause);
        }
    }

    undoBtnHandler() {
        if (this.sequence.isEmpty()) return;
        this.unselectPiece();
        this.forceGameUpdate(this.sequence.topMove().gameboard);
        this.turn = this.turn == CurrentPlayer.P1 ? CurrentPlayer.P2 : CurrentPlayer.P1;
        this.ruler.setValidMoves(this.turn);
        this.sequence.undo();
        this.setState(GameState.WaitPiecePick);
    }

    replayBtnHandler() {
        this.setState(GameState.Replay);
        this.sequence.replay(this, this.pieceAnimator);
    }

    mainMenuBtnHandler() {
        this.setState(GameState.Menu);
    }

    endGameBtnHandler() {
        this.setState(GameState.Idle);
    }

    changeCamBtnHandler() {
        this.animationCamera.handle(this.sceneGraph.scene.camera);
    }
}