import { CGFcamera, CGFcameraOrtho} from '/lib/CGF.js';
import { XMLParser, DEGREE_TO_RAD } from './XMLParser.js';
import { checkersViewName } from '../checkers/AnimationCamera.js';

export class XMLParserViews extends XMLParser {
    constructor(scene) {
        super(scene);
    }
    /**
     * Parses the <views> block.
     * @param {view block element} node
     */
    parse(node, checkers=false) {
        // object with all the viewsId associated with its properties
        this.scene.views = {};

        // default camera
        this.scene.defaultCam = null;

        // get the default camera id 
        const defaultCamera = this.reader.getString(node, 'default', false);
        if (!defaultCamera) return "you must specify a default prop on views";
        this.scene.defaultCam = defaultCamera;

        var children = node.children;

        for (var i = 0; i < children.length; i++) {
            const fromChild = children[i].children[0]; // from
            const toChild = children[i].children[1]; // to

            if (fromChild.nodeName != "from") {
                return "Missing tag <from> on View";
            } else if (toChild.nodeName != "to") {
                return "Missing tag <to> on View";
            }

            // get properties of views
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
            if (this.scene.views[id] != null)
                return "ID must be unique for each View (conflict: ID = " + id + ")";

            if (children[i].nodeName === 'perspective') {

                const angle = this.reader.getFloat(children[i], 'angle', false);
                if (!angle)
                    return "Missing property angle on View with id " + id;

                // create perspective camera with all parsed properties
                const camera = new CGFcamera(angle * DEGREE_TO_RAD, near, far, vec3.fromValues(from[0], from[1], from[2]), vec3.fromValues(to[0], to[1], to[2]));
                this.scene.views[id] = camera;
                this.scene.scene.cameras.push(id);
            } else if (children[i].nodeName === 'ortho') {

                const left = this.reader.getFloat(children[i], 'left', false);
                const right = this.reader.getFloat(children[i], 'right', false);
                const top = this.reader.getFloat(children[i], 'top', false);
                const bottom = this.reader.getFloat(children[i], 'bottom', false);
                
                // the up values are in the third child of node 'ortho' 
                const upChild = children[i].children[2];
                let upValues = [0, 1, 0];

                // get optional up tag
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
                
                // create ortho camera with all parsed properties
                this.scene.views[id] = new CGFcameraOrtho(left, right, bottom, top, near, far, from, to, upValues);
                this.scene.scene.cameras.push(id);
            } else {
                this.onXMLMinorError("unknown view tag <" + children[i].nodeName + ">");
            }

        }

        // check if the defaultCamera is defined
        if (!Object.keys(this.scene.views).includes(this.scene.defaultCam)) 
            return 'The default View specified it is not defined';
        
        // check if the checkers view is defined
        if (checkers && !Object.keys(this.scene.views).includes(checkersViewName))
            return 'The checkers view with id "Checkers" is not defined';
        
        return null;
    }
}