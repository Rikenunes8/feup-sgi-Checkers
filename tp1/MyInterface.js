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

    addLights(){
        const f1 = this.gui.addFolder("Lights");

        const lights = this.scene.graph.lights;

        let i = 0;
        for (let key in lights) {
            // must create an object with key property, otherwise f1.add retrieves an error because 
            // this.scene.graph.lights doesn't have a key property, just indexes
            this.scene.lightValues[key] = lights[key][0];
            f1.add(this.scene.lightValues, key).onChange(this.scene.updateLights.bind(this.scene, key, i));
            i++;
        }
    }

}