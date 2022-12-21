import { XMLParser } from "./XMLParser.js";
import { Gameboard } from "../checkers/boards/Gameboard.js";
import { Checkers } from "../checkers/Checkers.js";
import { AuxiliarBoard } from "../checkers/boards/AuxiliarBoard.js";

export class XMLParserCheckers extends XMLParser {
    constructor(scene) {
        super(scene);
    }

    parse(node) {
        var children = node.children;

        let nodeNames = [];
        for (var i = 0; i < children.length; i++) {
            nodeNames.push(children[i].nodeName);
        }

        const mainboardIndex = nodeNames.indexOf("mainboard");
        const piecesIndex = nodeNames.indexOf("pieces");
        const auxiliarboardIndex = nodeNames.indexOf("auxiliarboard");
        if (mainboardIndex == -1) return "missing mainboard definition in checkers";
        if (piecesIndex == -1) return "missing pieces definition in checkers";
        if (auxiliarboardIndex == -1) return "missing auxiliarboard definition in checkers";

        let mainboard = this.parseMainboard(children[mainboardIndex]);
        if (! mainboard instanceof Gameboard) return mainboard;

        let pieces = this.parsePieces(children[piecesIndex]);
        if (!Array.isArray(pieces)) return pieces;

        let auxiliarboard = this.parseAuxiliarBoard(children[auxiliarboardIndex]);
        if (! auxiliarboard instanceof AuxiliarBoard) return auxiliarboard;

        this.scene.scene.checkers = new Checkers(this.scene, mainboard, auxiliarboard, pieces);
    }

    /**
     * Parses mainboard tag
     * @param {*} mainboard node
     * @returns GameBoard object
     */
    parseMainboard(mainboard) {
        let p1 = this.parseCoordinates3D(mainboard, "mainboard bottom left corner not defined", ['x1', 'y1', 'z1']);
        let p2 = this.parseCoordinates3D(mainboard, "mainboard top right corner not defined", ['x2', 'y2', 'z2']);
        if (!Array.isArray(p1)) return p1;
        if (!Array.isArray(p2)) return p2;

        var materials = mainboard.children;
        let nodeNames = [];
        for (var i = 0; i < materials.length; i++) {
            nodeNames.push(materials[i].nodeName);
        }

        const lightTileIndex = nodeNames.indexOf("lightTile");
        const darkTileIndex = nodeNames.indexOf("darkTile");
        const boardWallsIndex = nodeNames.indexOf("boardWalls");

        if (lightTileIndex == -1) return "missing light tile definition in mainboard";
        if (darkTileIndex == -1) return "missing dark tile definition in mainboard";
        if (boardWallsIndex == -1) return "missing board walls definition in mainboard";

        const lightTileMaterialId = this.reader.getString(materials[lightTileIndex], 'id', false);
        const darkTileMaterialId = this.reader.getString(materials[darkTileIndex], 'id', false);
        const boardWallsMaterialId = this.reader.getString(materials[boardWallsIndex], 'id', false);


        if (this.scene.materials[lightTileMaterialId] == null) return "no material defined with ID " + lightTileMaterialId;
        if (this.scene.materials[darkTileMaterialId] == null) return "no material defined with ID " + darkTileMaterialId;
        if (this.scene.materials[boardWallsMaterialId] == null) return "no material defined with ID " + boardWallsMaterialId;

        return new Gameboard(this.scene, p1, p2, lightTileMaterialId, darkTileMaterialId, boardWallsMaterialId);
    }

    /**
     * Parses auxiliarboard tag
     * @param {*} auxiliarboard node 
     * @returns AuxiliarBoard object
     */
    parseAuxiliarBoard(mainboard) {
        let p1 = this.parseCoordinates3D(mainboard, "mainboard bottom left corner not defined", ['x1', 'y1', 'z1']);
        let p2 = this.parseCoordinates3D(mainboard, "mainboard top right corner not defined", ['x2', 'y2', 'z2']);
        if (!Array.isArray(p1)) return p1;
        if (!Array.isArray(p2)) return p2;

        var materials = mainboard.children;
        let nodeNames = [];
        for (var i = 0; i < materials.length; i++) {
            nodeNames.push(materials[i].nodeName);
        }

        const boardWallsIndex = nodeNames.indexOf("boardWalls");
        if (boardWallsIndex == -1) return "missing board walls definition in auxiliarboard";

        const boardWallsMaterialId = this.reader.getString(materials[boardWallsIndex], 'id', false);
        if (this.scene.materials[boardWallsMaterialId] == null) return "no material defined with ID " + boardWallsMaterialId;

        const buttonsMatIndex = nodeNames.indexOf("buttonsMaterial");
        if (buttonsMatIndex == -1) return "missing buttons material definition in auxiliarboard";

        const buttonsMaterialId = this.reader.getString(materials[buttonsMatIndex], 'id', false);
        if (this.scene.materials[buttonsMaterialId] == null) return "no material defined with ID " + buttonsMaterialId;

        return new AuxiliarBoard(this.scene, p1, p2, boardWallsMaterialId, buttonsMaterialId);
    }

    parsePieces(pieces) {
        var materials = pieces.children;
        let nodeNames = [];
        for (var i = 0; i < materials.length; i++) {
            nodeNames.push(materials[i].nodeName);
        }

        const type1 = nodeNames.indexOf("type1");
        const type2 = nodeNames.indexOf("type2");

        if (type1 == -1) return "missing type1 definition in pieces";
        if (type2 == -1) return "missing type2 definition in pieces";

        const type1MaterialId = this.reader.getString(materials[type1], 'id', false);
        const type2MaterialId = this.reader.getString(materials[type2], 'id', false);

        if (this.scene.materials[type1MaterialId] == null) return "no material defined with ID " + type1MaterialId;
        if (this.scene.materials[type2MaterialId] == null) return "no material defined with ID " + type2MaterialId;

        return [type1MaterialId, type2MaterialId];
    }

}