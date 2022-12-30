import { CGFappearance } from '../../lib/CGF.js';
import { XMLParser } from './XMLParser.js';

export class XMLParserMaterials extends XMLParser {
    constructor(scene) {
        super(scene);
    }
    /**
     * Parses the <materials> node.
     * @param {materials block element} node
     */
    parse(node) {
        var children = node.children;

        // Materials object with materialsId associated with a CGFappearance with properties
        this.scene.materials = {};

        var grandChildren = [];
        var nodeNames = [];

        const attributeNames = ["emission", "ambient", "diffuse", "specular"];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            let acc = [] // at the end will be [shininess, [r,g,b,a], [r,g,b,a], [r,g,b,a], [r,g,b,a]] in attributeNames order

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id', false);
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.scene.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            // Material shininess
            let shininess = this.reader.getFloat(children[i], 'shininess', false);
            if (shininess == null || shininess < 0) {
                this.onXMLMinorError("unable to parse value component of the 'shininess' field for ID = " + materialID + "; assuming 'value = 0.5'");
                shininess = 0.5;
            }
            acc.push(shininess);

            grandChildren = children[i].children;
            
            // Get grandChildren tag names
            nodeNames = [];
            for (let j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (let j = 0; j < attributeNames.length; j++) {
                let attributeIndex = nodeNames.indexOf(attributeNames[j]);
                
                if (attributeIndex === -1) // attribute name not found in grandChildrens
                    return "material component " + attributeNames[j] + " undefined for ID = " + materialID;
                
                let color = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " material component for ID" + materialID);
                if (!Array.isArray(color))
                    return color; // Error message from parseColor
                acc.push(color);
            }

            // Verify duplicates
            if (nodeNames.length != attributeNames.length)
                this.onXMLMinorError("material component is duplicated for ID = " + materialID);

            // create the material with its properties
            let material = new CGFappearance(this.scene.scene);
            material.setShininess(acc[0]);
            material.setEmission(acc[1][0], acc[1][1], acc[1][2], acc[1][3]);
            material.setAmbient(acc[2][0], acc[2][1], acc[2][2], acc[2][3]);
            material.setDiffuse(acc[3][0], acc[3][1], acc[3][2], acc[3][3]);
            material.setSpecular(acc[4][0], acc[4][1], acc[4][2], acc[4][3]);
            this.scene.materials[materialID] = material;
        }

        if (Object.keys(this.scene.materials).length === 0)
            return "at least one material must be defined";

        this.log("Parsed materials");
        return null;
    }
}