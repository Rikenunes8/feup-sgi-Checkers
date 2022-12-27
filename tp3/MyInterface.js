import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';

/**
* MyInterface class, creating a GUI interface.
*/

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)
        this.gui.add(this.scene, 'displayNormals').name("Display normals");
        this.gui.add(this.scene, 'displayLights').name("Display lights");
        this.gui.add(this.scene, 'resetAnimations').name("Reset Anims").onChange(this.scene.resetAnims);

        // a folder for grouping parameters for one of the lights

        this.initKeys();

        return true;
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
        if (event.code == "KeyM") {
            this.scene.updateMaterials();
        }
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }

    /**
     * Add cameras folder with all cameras to the interface so we can swap between cameras
     */
    addCameras() {
        const f0 = this.gui.addFolder('Cameras');
        f0.add(this.scene, 'currCam', this.scene.cameras).name("Current Camera").onChange(this.scene.setCamera);
    }

    /**
     * Add lights folder to interface so we can enable or disable them
     */
    addLights() {
        const folder = this.gui.addFolder('Lights');
        for (let c = 0; c < Object.keys(this.scene.graph.lights).length; c++) {
            folder.add(this.scene.lights[c], 'enabled').name(this.scene.lights[c].name);
        }
    }

    addHighlighted() {
        const folder = this.gui.addFolder('Highlighted');
        for (let c = 0; c < Object.keys(this.scene.graph.highlightedComponents).length; c++) {
            folder.add(this.scene.graph.highlightedComponents[c], 'isHighlighted').name(this.scene.graph.highlightedComponents[c].id).onChange();
        }
    }

    addHighlightValidMoves() {
        this.gui.add(this.scene.checkers, 'showValidMoves').name("Valid Moves");
    }
}