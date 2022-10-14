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
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }

    addCameras() {
        const f0 = this.gui.addFolder('Cameras');
        f0.add(this.scene, 'currCam', this.scene.cameras).name("Current Camera").onChange(this.scene.setCamera);
    }
    addLights() {
        const folder = this.gui.addFolder('Lights');
        let c = 0;
        for (let _ in this.scene.graph.lights) {
            folder.add(this.scene.lights[c], 'enabled').name(this.scene.lights[c].name);
            c++;
        }
    }
}