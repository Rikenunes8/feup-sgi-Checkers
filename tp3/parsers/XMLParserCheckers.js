import { XMLParser } from "./XMLParser.js";
import { GameBoard } from "../checkers/boards/GameBoard.js";
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
        const auxiliarboardIndex = nodeNames.indexOf("auxiliarboard");
        const piecesIndex = nodeNames.indexOf("pieces");
        const spotlightIndex = nodeNames.indexOf("spot");
        if (mainboardIndex == -1) return "missing mainboard definition in checkers";
        if (auxiliarboardIndex == -1) return "missing auxiliarboard definition in checkers";
        if (piecesIndex == -1) return "missing pieces definition in checkers";
        if (spotlightIndex == -1) return "missing spot definition in checkers";

        let mainboard = this.parseMainboard(children[mainboardIndex]);
        if (! (mainboard instanceof GameBoard)) return mainboard;

        let auxiliarboard = this.parseAuxiliarBoard(children[auxiliarboardIndex]);
        if (! (auxiliarboard instanceof AuxiliarBoard)) return auxiliarboard;
        
        let pieces = this.parsePieces(children[piecesIndex]);
        if (!Array.isArray(pieces)) return pieces;

        let spotlightHeight = this.parseSpotlight(children[spotlightIndex], mainboard.getCenter());
        if (typeof spotlightHeight == "string") return spotlightHeight;

        this.scene.scene.checkers = new Checkers(this.scene, mainboard, auxiliarboard, pieces, spotlightHeight);
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
        const highlightTileIndex = nodeNames.indexOf("highlightTile");

        if (lightTileIndex == -1) return "missing light tile definition in mainboard";
        if (darkTileIndex == -1) return "missing dark tile definition in mainboard";
        if (boardWallsIndex == -1) return "missing board walls definition in mainboard";
        if (highlightTileIndex == -1) return "missing highlight tile definition in mainboard";

        const lightTileMaterialId = this.reader.getString(materials[lightTileIndex], 'id', false);
        const darkTileMaterialId = this.reader.getString(materials[darkTileIndex], 'id', false);
        const boardWallsMaterialId = this.reader.getString(materials[boardWallsIndex], 'id', false);
        const highlightTileMaterialId = this.reader.getString(materials[highlightTileIndex], 'id', false);

        if (this.scene.materials[lightTileMaterialId] == null) return "no material defined with ID " + lightTileMaterialId;
        if (this.scene.materials[darkTileMaterialId] == null) return "no material defined with ID " + darkTileMaterialId;
        if (this.scene.materials[boardWallsMaterialId] == null) return "no material defined with ID " + boardWallsMaterialId;
        if (this.scene.materials[highlightTileMaterialId] == null) return "no material defined with ID " + highlightTileMaterialId;

        return new GameBoard(this.scene, p1, p2, lightTileMaterialId, darkTileMaterialId, boardWallsMaterialId, highlightTileMaterialId);
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

        var children = mainboard.children;
        let nodeNames = [];
        for (var i = 0; i < children.length; i++) {
            nodeNames.push(children[i].nodeName);
        }

        const boardWallsIndex = nodeNames.indexOf("boardWalls");
        const lightTileIndex = nodeNames.indexOf("lightTile");
        const darkTileIndex = nodeNames.indexOf("darkTile");
        const fontColorIndex = nodeNames.indexOf("fontColor");

        if (boardWallsIndex == -1) return "missing board walls definition in auxiliarboard";
        if (lightTileIndex == -1) return "missing light tile definition in auxiliarboard";
        if (darkTileIndex == -1) return "missing dark tile definition in auxiliarboard";
        if (fontColorIndex == -1) return "missing font color definition in auxiliarboard";

        const boardWallsMaterialId = this.reader.getString(children[boardWallsIndex], 'id', false);
        const lightTileMaterialId = this.reader.getString(children[lightTileIndex], 'id', false);
        const darkTileMaterialId = this.reader.getString(children[darkTileIndex], 'id', false);
        const fontColor = this.parseColor(children[fontColorIndex], "fontColor for auxiliarboard in checkers");

        if (this.scene.materials[boardWallsMaterialId] == null) return "no material defined with ID " + boardWallsMaterialId;
        if (this.scene.materials[lightTileMaterialId] == null) return "no material defined with ID " + lightTileMaterialId;
        if (this.scene.materials[darkTileMaterialId] == null) return "no material defined with ID " + darkTileMaterialId;
        if (!Array.isArray(fontColor)) return fontColor;

        return new AuxiliarBoard(this.scene, p1, p2, boardWallsMaterialId, lightTileMaterialId, darkTileMaterialId, fontColor);
    }

    parsePieces(pieces) {
        var materials = pieces.children;
        let nodeNames = [];
        for (var i = 0; i < materials.length; i++) {
            nodeNames.push(materials[i].nodeName);
        }

        const type1 = nodeNames.indexOf("type1");
        const type2 = nodeNames.indexOf("type2");
        const highlight = nodeNames.indexOf("highlight");

        if (type1 == -1) return "missing type1 definition in pieces";
        if (type2 == -1) return "missing type2 definition in pieces";
        if (highlight == -1) return "missing highlight definition in pieces";

        const type1MaterialId = this.reader.getString(materials[type1], 'id', false);
        const type2MaterialId = this.reader.getString(materials[type2], 'id', false);
        const highlightMaterialId = this.reader.getString(materials[highlight], 'id', false);

        if (this.scene.materials[type1MaterialId] == null) return "no material defined with ID " + type1MaterialId;
        if (this.scene.materials[type2MaterialId] == null) return "no material defined with ID " + type2MaterialId;
        if (this.scene.materials[highlightMaterialId] == null) return "no material defined with ID " + highlightMaterialId;

        return [type1MaterialId, type2MaterialId, highlightMaterialId];
    }

    parseSpotlight(spotlight, boardCenter) {
        let global = [];
        let attributeNames = [];
        let attributeTypes = [];
        // add light properties
        attributeNames.push(...["ambient", "diffuse", "specular", "attenuation"]);
        attributeTypes.push(...["color", "color", "color", "greatness"]);

        // Get id of the current light.
        const lightId = this.reader.getString(spotlight, 'id', false);
        if (lightId == null || lightId != "checkersSpotlight") 
            return "no ID \"checkersSpotlight\" defined for checkers spotlight";
        // Checks for repeated IDs.
        if (this.scene.lights[lightId] != null)
            return "ID must be unique for each light (conflict: ID = " + lightId + ")";

        const enabled = true;

        //Add enabled boolean and type name to light info
        global.push(enabled);
        global.push(spotlight.nodeName);

        const lightProps = spotlight.children;

        // Specifications for the current light.
        const nodeNames = [];
        for (let j = 0; j < lightProps.length; j++) {
            nodeNames.push(lightProps[j].nodeName);
        }

        const position = [boardCenter[0], boardCenter[1] + 10, boardCenter[2], 1.0];
        global.push(...[position]);

        for (let j = 0; j < attributeNames.length; j++) {
            let attributeIndex = nodeNames.indexOf(attributeNames[j]);
            let aux;
            if (attributeIndex != -1) {
                if (attributeTypes[j] == 'color') 
                    aux = this.parseColor(lightProps[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);
                else {
                    const messageError = "'attenuation' component of light " + lightId;

                    // get light attenuation
                    const c = this.reader.getFloat(lightProps[attributeIndex], 'constant');
                    if (!(c != null && !isNaN(c) && (c == 0 || c == 1)))
                        return "unable to parse 'constant' component of the " + messageError;

                    const l = this.reader.getFloat(lightProps[attributeIndex], 'linear');
                    if (!(l != null && !isNaN(l) && (l == 0 || l == 1)))
                        return "unable to parse 'linear' component of the " + messageError;

                    const q = this.reader.getFloat(lightProps[attributeIndex], 'quadratic');
                    if (!(q != null && !isNaN(q) && (q == 0 || q == 1)))
                        return "unable to parse B component of the " + messageError;

                    aux = [...[c, l, q]];

                    if (aux.reduce((a, b) => a+b, 0) != 1)
                        return "only a property should be 1.0 in " + messageError;
                }
                if (!Array.isArray(aux))
                    return aux;

                global.push(aux);
            }
            else
                return "light " + attributeNames[j] + " undefined for ID = " + lightId;
        }

        // Gets the additional attributes of the spot light
        var angle = this.reader.getFloat(spotlight, 'angle');
        if (!(angle != null && !isNaN(angle)))
            return "unable to parse angle of the light for ID = " + lightId;

        var exponent = this.reader.getFloat(spotlight, 'exponent');
        if (!(exponent != null && !isNaN(exponent)))
            return "unable to parse exponent of the light for ID = " + lightId;

        var targetLight = [boardCenter[0], boardCenter[1], boardCenter[2]];;

        global.push(...[angle, exponent, targetLight])

        var heigth = this.reader.getFloat(spotlight, 'height');
        if (!(heigth != null && !isNaN(heigth)))
            return "unable to parse height of the light for ID = " + lightId;

        this.scene.lights[lightId] = global;
        return heigth;
    }

}