import { XMLParser } from './XMLParser.js';

export class XMLParserScene extends XMLParser {
    constructor(scene) {
        super(scene);
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} node
     */
    parse(node) {

        // Get root of the scene.
        var root = this.reader.getString(node, 'root')
        if (root == null)
            return "no root defined for scene";

        this.scene.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(node, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.scene.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }
}