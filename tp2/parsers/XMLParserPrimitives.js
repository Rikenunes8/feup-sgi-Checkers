import { XMLParser } from './XMLParser.js';
import { MyCylinder } from '../components/MyCylinder.js';
import { MyRectangle } from '../components/MyRectangle.js';
import { MySphere } from '../components/MySphere.js';
import { MyTorus } from '../components/MyTorus.js';
import { MyTriangle } from '../components/MyTriangle.js';

export class XMLParserPrimitives extends XMLParser {
    constructor(scene) {
        super(scene);
    }
    /**
     * Parses the <primitives> block.
     * @param {primitives block element} node
     */
    parse(node) {
        var children = node.children;

        // object with the id of the primitives associated with its properties
        this.scene.primitives = {};

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
            if (this.scene.primitives[primitiveId] != null)
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

    /**
     * Parses primitive rectangle and updates this.scene.primitives with it
     * @param {*} node 
     * @param {*} primitiveId 
     * @returns error message if some required property, none otherwise
     */
    parsePrimitiveRectangle(node, primitiveId) {

        // check required rectangle properties
        var x1 = this.reader.getFloat(node, 'x1');
        if (!(x1 != null && !isNaN(x1)))
            return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

        var y1 = this.reader.getFloat(node, 'y1');
        if (!(y1 != null && !isNaN(y1)))
            return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

        var x2 = this.reader.getFloat(node, 'x2');
        if (!(x2 != null && !isNaN(x2) && x2 > x1))
            return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

        var y2 = this.reader.getFloat(node, 'y2');
        if (!(y2 != null && !isNaN(y2) && y2 > y1))
            return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

        this.scene.primitives[primitiveId] = new MyRectangle(this.scene.scene, primitiveId, x1, x2, y1, y2);;
    }

    /**
     * Parses primitive cylinder and updates this.scene.primitives with it
     * @param {*} node 
     * @param {*} primitiveId 
     * @returns error message if some required property, none otherwise
     */
    parsePrimitiveCylinder(node, primitiveId) {

        // check required cylinder properties
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

        this.scene.primitives[primitiveId] = new MyCylinder(this.scene.scene, primitiveId, base, top, height, slices, stacks);;
    }

    /**
     * Parses primitive cylinder and updates this.scene.primitives with it
     * @param {*} node 
     * @param {*} primitiveId 
     * @returns error message if some required property, none otherwise
     */
    parsePrimitiveSphere(node, primitiveId) {
        
        // check required sphere properties
        var radius = this.reader.getFloat(node, 'radius', false);
        if (radius == null || isNaN(radius) || radius < 0)
            return "unable to parse radius of the sphere for ID = " + primitiveId;
        var slices = this.reader.getInteger(node, 'slices', false);
        if (slices == null || isNaN(slices) || slices < 3)
            return "unable to parse slices of the sphere for ID = " + primitiveId;
        var stacks = this.reader.getInteger(node, 'stacks', false);
        if (stacks == null || isNaN(stacks) || stacks < 1)
            return "unable to parse stacks of the sphere for ID = " + primitiveId;

        this.scene.primitives[primitiveId] = new MySphere(this.scene.scene, primitiveId, radius, slices, stacks);;
    }

    /**
     * Parses primitive torus and updates this.scene.primitives with it
     * @param {*} node 
     * @param {*} primitiveId 
     * @returns error message if some required property, none otherwise
     */
    parsePrimitiveTorus(node, primitiveId) {
        // check required torus properties
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

        this.scene.primitives[primitiveId] = new MyTorus(this.scene.scene, primitiveId, inner, outer, slices, loops);;
    }

    /**
     * Parses primitive triangle and updates this.scene.primitives with it
     * @param {*} node 
     * @param {*} primitiveId 
     * @returns error message if some required property, none otherwise
     */
    parsePrimitiveTriangle(node, primitiveId) {

        // get triangle required properties
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
        
        if (pos1[0] == null || isNaN(pos1[0]))
            return "You must specify x1 position on Triangle primitive " + primitiveId;
        else if (pos1[1] == null || isNaN(pos1[1]))
            return "You must specify y1 position on Triangle primitive " + primitiveId;
        else if (pos1[2] == null || isNaN(pos1[2]))
            return "You must specify z1 position on Triangle primitive " + primitiveId;
        else if (pos2[0] == null || isNaN(pos2[0]))
            return "You must specify x2 position on Triangle primitive " + primitiveId;
        else if (pos2[1] == null || isNaN(pos2[1]))
            return "You must specify y2 position on Triangle primitive " + primitiveId;
        else if (pos2[2] == null || isNaN(pos2[2]))
            return "You must specify z2 position on Triangle primitive " + primitiveId;
        else if (pos3[0] == null || isNaN(pos3[0]))
            return "You must specify x3 position on Triangle primitive " + primitiveId;
        else if (pos3[1] == null || isNaN(pos3[1]))
            return "You must specify y3 position on Triangle primitive " + primitiveId;
        else if (pos3[2] == null || isNaN(pos3[2]))
            return "You must specify z3 position on Triangle primitive " + primitiveId;

        this.scene.primitives[primitiveId] = new MyTriangle(this.scene.scene, primitiveId, pos1, pos2, pos3);
    }
}