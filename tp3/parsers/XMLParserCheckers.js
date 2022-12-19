import { XMLParser } from "./XMLParser.js";
import { Gameboard } from "../checkers/Gameboard.js";
import { Checkers } from "../checkers/Checkers.js";

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

        var mainboardIndex = nodeNames.indexOf("mainboard");
        if (mainboardIndex == -1) return "missing mainboard definition in checkers";

        let mainboard = this.parseMainboard(children[mainboardIndex]);
        if (! mainboard instanceof Gameboard) return mainboard;

        this.scene.checkers = new Checkers(this.scene, mainboard);
    }

    parseMainboard(mainboard) {
        let p1 = this.parseCoordinates3D(mainboard, "mainboard bottom left corner not defined", ['x1', 'y1', 'z1']);
        let p2 = this.parseCoordinates3D(mainboard, "mainboard top right corner not defined", ['x2', 'y2', 'z2']);
        if (!Array.isArray(p1)) return p1;
        if (!Array.isArray(p2)) return p2;

        return new Gameboard(this.scene, p1, p2);
    }
}