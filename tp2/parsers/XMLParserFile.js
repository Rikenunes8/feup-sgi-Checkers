import { XMLParser } from './XMLParser.js';

import {XMLParserScene} from './XMLParserScene.js';
import {XMLParserViews} from './XMLParserViews.js';
import {XMLParserAmbient} from './XMLParserAmbient.js';
import {XMLParserLights} from './XMLParserLights.js';
import {XMLParserTextures} from './XMLParserTextures.js';
import {XMLParserMaterials} from './XMLParserMaterials.js';
import {XMLParserTransformations} from './XMLParserTransformations.js';
import {XMLParserPrimitives} from './XMLParserPrimitives.js';
import {XMLParserComponents} from './XMLParserComponents.js';

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

export class XMLParserFile extends XMLParser {
    constructor(scene) {
        super(scene);
    }
    parse(rootElement) {
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];
        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        const data = {
            'scene': {'index': SCENE_INDEX, 'parser': new XMLParserScene(this.scene)},
            'views': {'index': VIEWS_INDEX, 'parser': new XMLParserViews(this.scene)},
            'ambient': {'index': AMBIENT_INDEX, 'parser': new XMLParserAmbient(this.scene)},
            'lights': {'index': LIGHTS_INDEX, 'parser': new XMLParserLights(this.scene)},
            'materials': {'index': MATERIALS_INDEX, 'parser': new XMLParserMaterials(this.scene)},
            'textures': {'index': TEXTURES_INDEX, 'parser': new XMLParserTextures(this.scene)},
            'transformations': {'index': TRANSFORMATIONS_INDEX, 'parser': new XMLParserTransformations(this.scene)},
            'primitives': {'index': PRIMITIVES_INDEX, 'parser': new XMLParserPrimitives(this.scene)},
            'components': {'index': COMPONENTS_INDEX, 'parser': new XMLParserComponents(this.scene)},
        }
        
        // Processes each node, verifying errors.
        for (let element in data) {
            if ((error = this.parseMainElement(data, nodeNames, nodes, element)) != null) {
                return error
            }
        }

        if ((error = this.verifyComponentsRefsExistence()) != null)
            return error;

        this.log("all parsed");
    }
    
    parseMainElement(data, nodeNames, nodes, name) {
        var index;
        if ((index = nodeNames.indexOf(name)) == -1)
            return "tag <" + name + "> missing";
        else {
            if (index != data[name]['index'])
                this.onXMLMinorError("tag <" + name + "> out of order " + index);

            //Parse element block
            let error = data[name]['parser'].parse(nodes[index])
            if (error != null)
                return error;
        }
        return null;
    }

    /**
     * Go through the graph in depht first search and check for the component reference existence and if there are cycles
     * @returns {string} String with the error or null if no error
     */
    verifyComponentsRefsExistence() {
        return  this.verifyComponentsRefsExistenceRec([false, this.scene.idRoot], new Set());
    }
    /**
     * Recursive version of verifyComponentsRefsExistence
     * @param {[boolean, string]} node 
     * @param {*} visited Array of visited nodes
     * @returns {string} String with the error or null if no error
     */
    verifyComponentsRefsExistenceRec(node, visited) {
        const isPrimitive = node[0];
        const nodeId = node[1]
        if (!isPrimitive) {
            const component = this.scene.components[nodeId];
            if (component == null) return "component " + nodeId + " is not defined";
            if (visited.has(nodeId)) return "cyclic reference detected in component " + nodeId;
            visited.add(nodeId);
            for (let child of this.scene.components[nodeId].children) {
                const error = this.verifyComponentsRefsExistenceRec(child, visited);
                if (error != null) return error;
            }
            visited.delete(nodeId);
        }
        return null;
    }
}