import { CGFappearance, CGFcamera, CGFcameraOrtho, CGFtexture, CGFXMLreader } from '../lib/CGF.js';
import { XMLParserFile } from './parsers/XMLParserFile.js';

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

        this.displayNormals = false;

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
        var error = new XMLParserFile(this).parse(rootElement);
        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
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

        const rootComponent = this.components[this.idRoot]
        this.displayNode([false, this.idRoot], 
            rootComponent.getMaterial(), 
            rootComponent.getTexture(), 
            rootComponent.getHighlighted());

        //To test the parsing/creation of the primitives, call the display function directly
        // this.primitives['demoRectangle'].display();
        // this.primitives['demoCylinder'].display();
        // this.primitives['demoSphere'].display();
        // this.primitives['demoTorus'].display();
        // this.primitives['patch'].display();
    }

    /**
     * Displays a node
     * @param {*} node [isPrimitive, nodeId]
     * @param {*} prevMaterial 
     * @param {*} prevTexture 
     */
    displayNode(node, prevMaterial, prevTexture, prevHighlighted) {
        const isPrimitive = node[0];
        const nodeId = node[1];
        if (isPrimitive) {
            if (prevHighlighted != null)
                this.scene.setActiveShader(this.scene.highlightedShader);
            else if (this.scene.activeShader != this.scene.defaultShader)
                this.scene.setActiveShader(this.scene.defaultShader);
            this.primitives[nodeId].updateTexCoords(prevTexture.slice(-2))
            this.primitives[nodeId].display();
        }
        else {
            const component = this.components[nodeId];
            let material = component.getMaterial();
            let texture = component.getTexture();
            let highlighted = component.getHighlighted();

            if (material === 'inherit') material = prevMaterial;
            if (texture[0] === 'inherit') texture = [...prevTexture]

            this.scene.pushMatrix();
            this.scene.multMatrix(component.transfMatrix);
            for (let child of component.children) {
                if (texture[0] === 'none') material.setTexture(null);
                else material.setTexture(this.textures[texture[0]]);
                material.setTextureWrap('REPEAT', 'REPEAT');
                material.apply();

                this.displayNode(child, material, texture, highlighted);
            }
            this.scene.popMatrix();
        }
    }
}
