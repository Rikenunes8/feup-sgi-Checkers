import { CGFappearance, CGFcamera, CGFcameraOrtho, CGFtexture, CGFXMLreader } from '/lib/CGF.js';
import { XMLParser } from './XMLParser.js';

export class XMLParserAmbient extends XMLParser {
    constructor(scene) {
        super(scene);
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} node
     */
    parse(node) {
        var children = node.children;

        this.scene.ambient = [];
        this.scene.background = [];

        var nodeNames = [];
        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.scene.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.scene.background = color;

        this.log("Parsed ambient");

        return null;
    }
}