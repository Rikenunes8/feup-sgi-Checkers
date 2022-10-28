import { XMLParser } from './XMLParser.js';

export class XMLParserTransformations extends XMLParser {
    constructor(scene) {
        super(scene);
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
                switch (grandChildren[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        atLeastOne = true;
                        break;
                    case 'scale':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "scale transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                        atLeastOne = true;
                        break;
                    case 'rotate':
                        // angle
                        let angle = this.reader.getFloat(grandChildren[j], 'angle', false);
                        if (!(angle != null && !isNaN(angle)))
                            return "unable to parse angle of the rotate transformation for ID " + transformationID;

                        // axis
                        const axisNames = ['x', 'y', 'z']
                        let axisArr = [0, 0, 0];
                        const axis = this.reader.getString(grandChildren[j], 'axis', false);
                        if (axis == null)
                            return "unable to parse axis of the rotate transformation for ID " + transformationID;
                        const index = axisNames.indexOf(axis);
                        if (index !== -1)
                            axisArr[index] = 1;
                        else
                            return "unable to parse axis of the rotate transformation for ID " + transformationID + "; the axis should belong to {x,y,z} instead of " + axis;


                        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle*DEGREE_TO_RAD, axisArr);
                        atLeastOne = true;
                        break;
                    default:
                        this.onXMLMinorError("unknown tag <" + grandChildren[j].nodeName + ">");
                        break;
                }
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
}