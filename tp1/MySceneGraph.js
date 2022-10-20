import { CGFappearance, CGFcamera, CGFcameraOrtho, CGFtexture, CGFXMLreader } from '../lib/CGF.js';
import { MyCylinder } from './MyCylinder.js';
import { MyRectangle } from './MyRectangle.js';
import { MyComponent } from './MyComponent.js';
import { MySphere } from './MySphere.js';
import { MyTorus } from './MyTorus.js';
import { MyTriangle } from './MyTriangle.js';

export var DEGREE_TO_RAD = Math.PI / 180;

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

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        this.displayNormals = false; // TODO testing

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }


    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
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
            'scene': {'index': SCENE_INDEX, 'parser': (node) => this.parseScene(node)},
            'views': {'index': VIEWS_INDEX, 'parser': (node) => this.parseView(node)},
            'ambient': {'index': AMBIENT_INDEX, 'parser': (node) => this.parseAmbient(node)},
            'lights': {'index': LIGHTS_INDEX, 'parser': (node) => this.parseLights(node)},
            'materials': {'index': MATERIALS_INDEX, 'parser': (node) => this.parseMaterials(node)},
            'textures': {'index': TEXTURES_INDEX, 'parser': (node) => this.parseTextures(node)},
            'transformations': {'index': TRANSFORMATIONS_INDEX, 'parser': (node) => this.parseTransformations(node)},
            'primitives': {'index': PRIMITIVES_INDEX, 'parser': (node) => this.parsePrimitives(node)},
            'components': {'index': COMPONENTS_INDEX, 'parser': (node) => this.parseComponents(node)},
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
            let error = data[name]['parser'](nodes[index])
            if (error != null)
                return error;
        }
        return null;
    }


    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {

        this.views = {};

        this.defaultCam = null;
        
        // get the default camera id 
        const defaultCamera = this.reader.getString(viewsNode, 'default', false);

        // TODO return check this error message 
        if (!defaultCamera) {
            return "you must specify a default prop on views";
        } else {
            this.defaultCam = defaultCamera;
        }

        var children = viewsNode.children;

        for (var i = 0; i < children.length; i++) {
            const fromChild = children[i].children[0]; // from
            const toChild = children[i].children[1]; // to
            
            if (fromChild.nodeName != "from") {
                return "Missing tag <from> on View";
            } else if (toChild.nodeName != "to") {
                return "Missing tag <to> on View";
            }

            const id = this.reader.getString(children[i], 'id', false);
            const near = this.reader.getFloat(children[i], 'near', false);
            const far = this.reader.getFloat(children[i], 'far', false);
            const from = this.parseCoordinates3D(fromChild, "'from' property for ID " + id);
            const to = this.parseCoordinates3D(toChild, "'to' property for ID " + id);

            if (!id) {
                return "Missing property id on " + children[i].nodeName + " View";
            } else if (!near) {
                return "Missing property near on View with id " + id;
            } else if (!far) {
                return "Missing property far on View with id " + id;
            }

            if (!Array.isArray(from))
                return from;
            else if (!Array.isArray(to))
                return to;


            // Checks for repeated IDs.
            if (this.views[id] != null)
                return "ID must be unique for each View (conflict: ID = " + id + ")";

            if (children[i].nodeName === 'perspective') {

                const angle = this.reader.getFloat(children[i], 'angle', false);
                if (!angle)
                    return "Missing property angle on View with id " + id;

                const camera = new CGFcamera(angle * DEGREE_TO_RAD, near, far, vec3.fromValues(from[0], from[1], from[2]), vec3.fromValues(to[0], to[1], to[2]));
                this.views[id] = camera;
                this.scene.cameras.push(id);
            } else if (children[i].nodeName === 'ortho') {

                const left = this.reader.getFloat(children[i], 'left', false);
                const right = this.reader.getFloat(children[i], 'right', false);
                const top = this.reader.getFloat(children[i], 'top', false);
                const bottom = this.reader.getFloat(children[i], 'bottom', false);
                
                // the up values are in the third child of node 'ortho' 
                const upChild = children[i].children[2];
                let upValues = [0, 1, 0];
                if (upChild) {
                    if (upChild.nodeName !== 'up') this.onXMLMinorError("Uknown property " + upChild.nodeName + ' for view ' + id);
                    else upValues = this.parseCoordinates3D(upChild, "'up' property for ID " + id);
                }

                if (!left) {
                    return "Missing property left on Ortho View with id " + id;
                } else if (!right) {
                    return "Missing property right on Ortho View with id " + id;
                } else if (!top) {
                    return "Missing property top on Ortho View with id " + id;
                } else if (!bottom) {
                    return "Missing property bottom on Ortho View with id " + id;
                }
                if (!Array.isArray(upValues))
                    return upValues;

                this.views[id] = new CGFcameraOrtho(left, right, bottom, top, near, far, from, to, upValues);
                this.scene.cameras.push(id);
            } else {
                this.onXMLMinorError("unknown view tag <" + children[i].nodeName + ">");
            }

        }

        // check if the defaultCamera is defined
        if (!Object.keys(this.views).includes(this.defaultCam)) 
            return 'The default View specified it is not defined';

        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];
        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = {};
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
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
                attributeNames.push(...["location", "ambient", "diffuse", "specular", "attenuation"]);
                attributeTypes.push(...["position", "color", "color", "color", "greatness"]);
            }

            // Get id of the current light.
            const lightId = this.reader.getString(children[i], 'id', false);
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
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
                        // constant
                        const c = this.reader.getFloat(grandChildren[attributeIndex], 'constant');
                        if (!(c != null && !isNaN(c) && (c == 0 || c == 1)))
                            return "unable to parse 'constant' component of the " + messageError;
                
                        // linear
                        const l = this.reader.getFloat(grandChildren[attributeIndex], 'linear');
                        if (!(l != null && !isNaN(l) && (l == 0 || l == 1)))
                            return "unable to parse 'linear' component of the " + messageError;
                
                        // quadratic
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

                // Retrieves the light target.
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

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        var children = texturesNode.children;

        this.textures = {};

        for (let i = 0 ; i < children.length; i++) {
            if (children[i].nodeName != "texture") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current texture.
            const textureId = this.reader.getString(children[i], 'id', false);
            if (textureId == null) 
                return "no ID defined for texture " + (i+1);
            // Checks for repeated IDs.
            if (this.textures[textureId] != null)
                return "ID must be unique for each texture (conflict: ID = " + textureId + ")";
            
            // Get file path of the current texture.
            const textureFile = this.reader.getString(children[i], 'file', false);
            if (textureFile == null) 
                return "no File defined for texture " + textureId;
            // Checks for file extension
            if (textureFile.match(/.*\.(png|jpg)/) == null)
                return "File defined for texture " + textureId + " must be in .png or .jpg format";

            this.textures[textureId] = new CGFtexture(this.scene, textureFile);
        }

        if (Object.keys(this.textures).length === 0)
            return "at least one texture must be defined";
            
        this.log("Parsed textures");
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = {};

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
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            // Material shininess
            let shininess = this.reader.getFloat(children[i], 'shininess', false);
            if (shininess == null || shininess < 0) { // TODO: what are the bounds of shininess
                this.onXMLMinorError("unable to parse value component of the 'shininess' field for ID = " + materialID + "; assuming 'value = 0.5'");
                shininess = 0.5; // TODO: is this default value ok?
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

            let material = new CGFappearance(this.scene);
            material.setShininess(acc[0]);
            material.setEmission(acc[1][0], acc[1][1], acc[1][2], acc[1][3]);
            material.setAmbient(acc[2][0], acc[2][1], acc[2][2], acc[2][3]);
            material.setDiffuse(acc[3][0], acc[3][1], acc[3][2], acc[3][3]);
            material.setSpecular(acc[4][0], acc[4][1], acc[4][2], acc[4][3]);
            this.materials[materialID] = material;
        }

        if (Object.keys(this.materials).length === 0)
            return "at least one material must be defined";

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

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
            if (this.transformations[transformationID] != null)
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
            this.transformations[transformationID] = transfMatrix;
        }
        if (Object.keys(this.transformations).length === 0)
            return "at least one transformation must be defined";

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = {};

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id', false);
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            let error;
            if (primitiveType == 'rectangle') {
                error = this.parsePrimitiveRectangle(grandChildren[0], primitiveId);
            } else if (primitiveType == "cylinder") {
                error = this.parsePrimitiveCylinder(grandChildren[0], primitiveId);
            } else if (primitiveType == "sphere") {
                error = this.parsePrimitiveSphere(grandChildren[0], primitiveId);
            } else if (primitiveType == "torus") {
                error = this.parsePrimitiveTorus(grandChildren[0], primitiveId);
            } else if (primitiveType == 'triangle') {
                error = this.parsePrimitiveTriangle(grandChildren[0], primitiveId);
            } else {
                console.warn("Primitive " + primitiveType + " not implemented.");
                continue;
            }
            if (error != null) return error;
        }

        this.log("Parsed primitives");
        return null;
    }

    parsePrimitiveRectangle(node, primitiveId) {
        // x1
        var x1 = this.reader.getFloat(node, 'x1');
        if (!(x1 != null && !isNaN(x1)))
            return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

        // y1
        var y1 = this.reader.getFloat(node, 'y1');
        if (!(y1 != null && !isNaN(y1)))
            return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

        // x2
        var x2 = this.reader.getFloat(node, 'x2');
        if (!(x2 != null && !isNaN(x2) && x2 > x1))
            return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

        // y2
        var y2 = this.reader.getFloat(node, 'y2');
        if (!(y2 != null && !isNaN(y2) && y2 > y1))
            return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

        this.primitives[primitiveId] = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);;
    }

    parsePrimitiveCylinder(node, primitiveId) {
        var base = this.reader.getFloat(node, 'base', false);
        if (base == null || isNaN(base) || base < 0)
            return "unable to parse base radius of the cyliinder for ID = " + primitiveId;
        var top = this.reader.getFloat(node, 'top', false);
        if (top == null || isNaN(top) || top < 0)
            return "unable to parse top radius of the cyliinder for ID = " + primitiveId;
        var height = this.reader.getFloat(node, 'height', false);
        if (height == null || isNaN(height) || height < 0)
            return "unable to parse height of the cyliinder for ID = " + primitiveId;
        var slices = this.reader.getInteger(node, 'slices', false);
        if (slices == null || isNaN(slices) || slices < 3)
            return "unable to parse slices of the cyliinder for ID = " + primitiveId;
        var stacks = this.reader.getInteger(node, 'stacks', false);
        if (stacks == null || isNaN(stacks) || stacks < 1)
            return "unable to parse stacks of the cyliinder for ID = " + primitiveId;

        this.primitives[primitiveId] = new MyCylinder(this.scene, primitiveId, base, top, height, slices, stacks);;
    }

    parsePrimitiveSphere(node, primitiveId) {
        var radius = this.reader.getFloat(node, 'radius', false);
        if (radius == null || isNaN(radius) || radius < 0)
            return "unable to parse radius of the sphere for ID = " + primitiveId;
        var slices = this.reader.getInteger(node, 'slices', false);
        if (slices == null || isNaN(slices) || slices < 3)
            return "unable to parse slices of the sphere for ID = " + primitiveId;
        var stacks = this.reader.getInteger(node, 'stacks', false);
        if (stacks == null || isNaN(stacks) || stacks < 1)
            return "unable to parse stacks of the sphere for ID = " + primitiveId;

        this.primitives[primitiveId] = new MySphere(this.scene, primitiveId, radius, slices, stacks);;
    }

    parsePrimitiveTorus(node, primitiveId) {
        var inner = this.reader.getFloat(node, 'inner', false);
        if (inner == null || isNaN(inner) || inner < 0)
            return "unable to parse inner radius of the torus for ID = " + primitiveId;
        var outer = this.reader.getFloat(node, 'outer', false);
        if (outer == null || isNaN(outer) || outer < 0)
            return "unable to parse outer radius of the torus for ID = " + primitiveId;
        var slices = this.reader.getInteger(node, 'slices', false);
        if (slices == null || isNaN(slices) || slices < 3)
            return "unable to parse slices of the torus for ID = " + primitiveId;
        var loops = this.reader.getInteger(node, 'loops', false);
        if (loops == null || isNaN(loops) || loops < 1)
            return "unable to parse loops of the torus for ID = " + primitiveId;

        this.primitives[primitiveId] = new MyTorus(this.scene, primitiveId, inner, outer, slices, loops);;
    }

    parsePrimitiveTriangle(node, primitiveId) {
        const pos1 = [
            this.reader.getFloat(node, 'x1', false),
            this.reader.getFloat(node, 'y1', false),
            this.reader.getFloat(node, 'z1', false)
        ];
        const pos2 = [
            this.reader.getFloat(node, 'x2', false),
            this.reader.getFloat(node, 'y2', false),
            this.reader.getFloat(node, 'z2', false)
        ];
        const pos3 = [
            this.reader.getFloat(node, 'x3', false),
            this.reader.getFloat(node, 'y3', false),
            this.reader.getFloat(node, 'z3', false)
        ];
        
        if (pos1[0] == null || isNaN(pos1[0]) || pos1[0] < 0)
            return "You must specify x1 position on Triangle primitive " + primitiveId;
        else if (pos1[1] == null || isNaN(pos1[1]) || pos1[1] < 0)
            return "You must specify y1 position on Triangle primitive " + primitiveId;
        else if (pos1[2] == null || isNaN(pos1[2]) || pos1[2] < 0)
            return "You must specify z1 position on Triangle primitive " + primitiveId;
        else if (pos2[0] == null || isNaN(pos2[0]) || pos2[0] < 0)
            return "You must specify x2 position on Triangle primitive " + primitiveId;
        else if (pos2[1] == null || isNaN(pos2[1]) || pos2[1] < 0)
            return "You must specify y2 position on Triangle primitive " + primitiveId;
        else if (pos2[2] == null || isNaN(pos2[2]) || pos2[2] < 0)
            return "You must specify z2 position on Triangle primitive " + primitiveId;
        else if (pos3[0] == null || isNaN(pos3[0]) || pos3[0] < 0)
            return "You must specify x3 position on Triangle primitive " + primitiveId;
        else if (pos3[1] == null || isNaN(pos3[1]) || pos3[1] < 0)
            return "You must specify y3 position on Triangle primitive " + primitiveId;
        else if (pos3[2] == null || isNaN(pos3[2]) || pos3[2] < 0)
            return "You must specify z3 position on Triangle primitive " + primitiveId;

        this.primitives[primitiveId] = new MyTriangle(this.scene, primitiveId, pos1, pos2, pos3);
    }

   /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = {};

        var grandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id', false);
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");

            if (transformationIndex == -1) return "missing tranformation definition in component " + componentID;
            if (materialsIndex == -1) return "missing materials definition in component " + componentID;
            if (textureIndex == -1) return "missing texture definition in component " + componentID;
            if (childrenIndex == -1) return "missing children definition in component " + componentID;

            let componentTransfMatrix = this.parseComponentTransformations(grandChildren[transformationIndex].children, componentID)
            let componentMaterials = this.parseComponentMaterials(grandChildren[materialsIndex].children, componentID);
            let componentTexture = this.parseComponentTexture(grandChildren[textureIndex], componentID);
            let componentChildren = this.parseComponentChildren(grandChildren[childrenIndex].children, componentID);

            if (!Array.isArray(componentTransfMatrix)) return componentTransfMatrix;
            if (!Array.isArray(componentMaterials)) return componentMaterials;
            if (!Array.isArray(componentTexture) && componentTexture != 'none' && componentTexture != 'inherit') return componentTexture;
            if (!Array.isArray(componentChildren)) return componentChildren;
            

            this.components[componentID] = new MyComponent(this.scene, componentID, componentTransfMatrix, componentMaterials, componentTexture, componentChildren);
        }

        this.log("Parsed components");
        return null;
    }

    parseComponentTransformations(transformations, componentID) {
        let transfMatrix = undefined;

        let transformationNames = [];
        for (let child of transformations) 
            transformationNames.push(child.nodeName);

        if (transformationNames.includes('transformationref')) {
            if (transformations.length === 1) {
                const transformationrefId = this.reader.getString(transformations[0], 'id', false);
                if (transformationrefId == null) return "no ID defined for transformationref defined in component " + componentID;

                if (this.transformations[transformationrefId] == null) return "no transformation defined with ID " + transformationrefId;

                transfMatrix = this.transformations[transformationrefId]
            }
            else 
                return  "transformationref must be a single definition inside transformation block of component " + componentID; 
        } else {
            transfMatrix = mat4.create();

            for (var j = 0; j < transformations.length; j++) {
                switch (transformations[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(transformations[j], "translate transformation for component ID " + componentID);
                        if (!Array.isArray(coordinates)) return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':
                        var coordinates = this.parseCoordinates3D(transformations[j], "scale transformation for component ID " + componentID);
                        if (!Array.isArray(coordinates)) return coordinates;

                        transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'rotate':
                        // angle
                        let angle = this.reader.getFloat(transformations[j], 'angle', false);
                        if (!(angle != null && !isNaN(angle))) return "unable to parse angle of the rotate transformation for component ID " + componentID;

                        // axis
                        const axisNames = ['x', 'y', 'z']
                        let axisArr = [0, 0, 0];
                        
                        const axis = this.reader.getString(transformations[j], 'axis', false);
                        if (axis == null)return "unable to parse axis of the rotate transformation for component ID " + componentID;

                        const index = axisNames.indexOf(axis);
                        if (index !== -1) axisArr[index] = 1;
                        else return "unable to parse axis of the rotate transformation for component ID " + componentID + "; the axis should belong to {x,y,z} instead of " + axis;


                        transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle*DEGREE_TO_RAD, axisArr);
                        break;
                    default:
                        this.onXMLMinorError("unknown tag <" + transformations[j].nodeName + ">");
                        break;
                }
            }
        }
        return [...transfMatrix];
    }

    parseComponentMaterials(materials, componentID) {
        let componentMaterials = [];
        for (let j = 0; j < materials.length; j++) {
            if (materials[j].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + materials[j].nodeName + ">");
                continue;
            }

            const materialId = this.reader.getString(materials[j], 'id', false);
            if (materialId == null) return "no ID defined for material defined in component " + componentID;

            if (materialId == 'inherit') {
                componentMaterials.push('inherit');
            } else {
                if (this.materials[materialId] == null) return "no material defined with ID " + materialId;
                componentMaterials.push(this.materials[materialId]);
            }
        }
        if (componentMaterials.length === 0)
            return "must exists at least one material declaration for component " + componentID;

        return [...componentMaterials];
    }

    parseComponentTexture(texture, componentID) {
        let componentTexture = undefined;
        const textureId = this.reader.getString(texture, 'id', false);
        if (textureId == null) return "no ID defined for texture defined in component " + componentID;

        if (textureId == 'none') {
            componentTexture = ['none', 1, 1];
        } else if (textureId == 'inherit') {
            componentTexture = ['inherit', 1, 1];
        } else {
            if (this.textures[textureId] == null) return "no texture defined with ID " + textureId;

            const length_s = this.reader.getFloat(texture, 'length_s', false);
            const length_t = this.reader.getFloat(texture, 'length_t', false);
            
            // if (length_s == null) return "no length_s defined for texture " + textureId + " in component " + componentID;
            // if (length_t == null) return "no length_t defined for texture " + textureId + " in component " + componentID;
            
            componentTexture = [textureId, length_s ?? 1, length_t ?? 1];
        }
        return componentTexture;
    }

    parseComponentChildren(children, componentID) {
        let componentChildren = [];
        for (let j = 0; j < children.length; j++) {
            if (children[j].nodeName == "primitiveref") {
                const childPrimitiveId = this.reader.getString(children[j], 'id', false);
                if (childPrimitiveId == null)
                    return "no ID defined for child primitive defined in component " + componentID;
                if (this.primitives[childPrimitiveId] == null) {
                    return "no primitive defined with ID " + childPrimitiveId;
                }
                componentChildren.push([true, childPrimitiveId]);
            } else if (children[j].nodeName == "componentref") {
                const childComponentId = this.reader.getString(children[j], 'id', false);
                if (childComponentId == null)
                    return "no ID defined for child component defined in component " + componentID;
                componentChildren.push([false, childComponentId]);
            } else {
                this.onXMLMinorError("unknown tag <" + children[j].nodeName + ">");
                continue;
            }
        }
        if (componentChildren.length === 0)
            return "must exists at least one children declaration for component " + componentID;

        return [...componentChildren];
    }

    verifyComponentsRefsExistence() {
        return  this.verifyComponentsRefsExistenceRec([false, this.idRoot], new Set());
    }
    verifyComponentsRefsExistenceRec(node, visited) {
        const isPrimitive = node[0];
        const nodeId = node[1]
        if (!isPrimitive) {
            const component = this.components[nodeId];
            if (component == null) return "component " + nodeId + " is not defined";
            if (visited.has(nodeId)) return "cyclic reference detected in component " + nodeId;
            visited.add(nodeId);
            for (let child of this.components[nodeId].children) {
                const error = this.verifyComponentsRefsExistenceRec(child, visited);
                if (error != null) return error;
            }
            visited.delete(nodeId);
        }
        return null;
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x', false);
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y', false);
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z', false);
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w', false);
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {

        for (let id in this.primitives) { 
            if (this.displayNormals)
                this.primitives[id].enableNormalViz();
            else
                this.primitives[id].disableNormalViz();
        }


        this.displayNode([false, this.idRoot], this.components[this.idRoot].getMaterial());

        //To test the parsing/creation of the primitives, call the display function directly
        // this.primitives['demoRectangle'].display();
        // this.primitives['demoCylinder'].display();
        // this.primitives['demoSphere'].display();
        // this.primitives['demoTorus'].display();
    }

    displayNode(node, prevMaterial, prevTexture) {
        const isPrimitive = node[0];
        const nodeId = node[1];
        if (isPrimitive) {
            this.primitives[nodeId].updateTexCoords(prevTexture.slice(-2))
            this.primitives[nodeId].display();
        }
        else {
            const component = this.components[nodeId];
            let material = component.getMaterial();
            let texture = component.getTexture();

            if (material === 'inherit') material = prevMaterial;
            if (texture[0] === 'inherit') texture = [...prevTexture]

            this.scene.pushMatrix();
            this.scene.multMatrix(component.transfMatrix);
            for (let child of component.children) {
                if (texture[0] === 'none') material.setTexture(null);
                else material.setTexture(this.textures[texture[0]]);
                material.setTextureWrap('REPEAT', 'REPEAT');
                material.apply();

                this.displayNode(child, material, texture);
            }
            this.scene.popMatrix();
        }
    }
}
