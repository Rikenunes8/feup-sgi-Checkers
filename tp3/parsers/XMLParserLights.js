import { XMLParser } from './XMLParser.js';

export class XMLParserLights extends XMLParser {
    constructor(scene) {
        super(scene);
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} node
     */
    parse(node, checkers=false) {
        var children = node.children;

        // object with lightId associated with its properties
        this.scene.lights = {};
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                // add light properties
                attributeNames.push(...["location", "ambient", "diffuse", "specular", "attenuation"]);
                attributeTypes.push(...["position", "color", "color", "color", "greatness"]);
            }

            // Get id of the current light.
            const lightId = this.reader.getString(children[i], 'id', false);
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.scene.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            const enabled = this.reader.getBoolean(children[i], 'enabled', false);
            if (!(enabled != null && !isNaN(enabled) && (enabled == true || enabled == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            const enableLight = enabled ?? 1;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;

            // Specifications for the current light.
            nodeNames = [];
            for (let j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (let j = 0; j < attributeNames.length; j++) {
                let attributeIndex = nodeNames.indexOf(attributeNames[j]);
                let aux;
                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else if (attributeTypes[j] == 'color') 
                        aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);
                    else {
                        const messageError = "'attenuation' component of light " + lightId;

                        // get light attenuation
                        const c = this.reader.getFloat(grandChildren[attributeIndex], 'constant');
                        if (!(c != null && !isNaN(c) && (c == 0 || c == 1)))
                            return "unable to parse 'constant' component of the " + messageError;

                        const l = this.reader.getFloat(grandChildren[attributeIndex], 'linear');
                        if (!(l != null && !isNaN(l) && (l == 0 || l == 1)))
                            return "unable to parse 'linear' component of the " + messageError;

                        const q = this.reader.getFloat(grandChildren[attributeIndex], 'quadratic');
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
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.scene.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > (checkers ? 7 : 8))
            this.onXMLerror("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }
}