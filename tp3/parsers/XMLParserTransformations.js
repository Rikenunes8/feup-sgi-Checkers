import { XMLParser } from './XMLParser.js';

export class XMLParserTransformations extends XMLParser {
    constructor(scene) {
        super(scene);

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} node
     */
    parse(node) {
        var children = node.children;
        this.scene.transformations = [];
        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {
            let atLeastOne = false;

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id', false);
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.scene.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;

            // Specifications for the current transformation.
            var transfMatrix = mat4.create();
            for (var j = 0; j < grandChildren.length; j++) {
                const nodeName = grandChildren[j].nodeName;
                if (nodeName == "translate" || nodeName == "rotate" || nodeName == "scale") atLeastOne = true;
                let error = this.parseSingleTransformation(transfMatrix, grandChildren[j], transformationID);
                if (error != null) return error;
            }
            if (!atLeastOne)
                return "at least one transfomation must be defined for ID " + transformationID;
            this.scene.transformations[transformationID] = transfMatrix;
        }
        if (Object.keys(this.scene.transformations).length === 0)
            return "at least one transformation must be defined";

        this.log("Parsed transformations");
        return null;
    }

    parseSingleTransformation(transfMatrix, node, id) {
        switch (node.nodeName) {
            case 'translate':
                var coordinates = this.parseCoordinates3D(node, "translate transformation for ID " + id);
                if (!Array.isArray(coordinates))
                    return coordinates;

                transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                break;
            case 'scale':
                var coordinates = this.parseCoordinates3D(node, "scale transformation for ID " + id);
                if (!Array.isArray(coordinates))
                    return coordinates;

                transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                break;
            case 'rotate':
                // angle
                let angle = this.reader.getFloat(node, 'angle', false);
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the rotate transformation for ID " + id;

                // axis
                const axis = this.reader.getString(node, 'axis', false);
                if (axis == null || !this.axisCoords[axis])
                    return "unable to parse axis of the rotate transformation for ID " + id;

                transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle*DEGREE_TO_RAD, axisArr);
                break;
            default:
                this.onXMLMinorError("unknown tag <" + node.nodeName + ">");
                break;
        }
    }
}