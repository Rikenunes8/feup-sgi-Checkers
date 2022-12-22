import { CGFappearance, CGFscene, CGFtexture } from '../lib/CGF.js';
import { CGFaxis,CGFcamera, CGFshader } from '../lib/CGF.js';
import { MainMenu } from './checkers/menu/MainMenu.js';
import { Menu } from './checkers/menu/Menu.js';
import { MyQuad } from './components/MyQuad.js';

var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.initCameras();

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);

        this.displayNormals = false;
        this.displayLights = false;
        this.displayingLights = this.displayLights;
        this.resetAnimations = true;

        this.cameras = [];
        this.currCam = 0;

        this.highlightedComponents = {};

        this.highlightedShader = new CGFshader(this.gl, "shaders/pulse.vert", "shaders/pulse.frag");
        this.highlightedShader.setUniformsValues({ timeFactor: 0 });

        this.initTextStuff();

        this.startTime = null;
		this.setUpdatePeriod(10);
        this.setPickEnabled(true);

        this.info = {
            initialMenu: false,
            selectedTheme: 1,
            playerMaxTime: 20,
            gameMaxTime: 2,
            initedGame: false,
        }

        this.mainMenu = new MainMenu(this, [0, 0], [10, 10]);
        this.menu = new Menu(this);
    }

    /**
     * Initializes text appearance, texture and shaders.
     * Initializes the primitive MyQuad used to render the text. 
     */
    initTextStuff() {
        // font texture: 16 x 16 characters
		// http://jens.ayton.se/oolite/files/font-tests/rgba/oolite-font.png
		this.fontTexture = new CGFtexture(this, "screenshots/oolite-font.trans.png");
        this.textAppearance = new CGFappearance(this);
        this.textAppearance.setTexture(this.fontTexture);

		// plane where texture character will be rendered
		this.quad = new MyQuad(this);

		// instatiate text shader (used to simplify access via row/column coordinates)
		// check the two files to see how it is done
		this.textShader = new CGFshader(this.gl, "shaders/font.vert", "shaders/font.frag");

		// set number of rows and columns in font texture
        this.textShader.setUniformsValues({ 'dims': [16, 16] })//, 'textColor': vec3.fromValues(0.0, 0.0, 0.0)});
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(50, 50, 50), vec3.fromValues(0, 0, 0));
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {

        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].name = key;

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);

                this.lights[i].setConstantAttenuation(light[6][0]);
                this.lights[i].setLinearAttenuation(light[6][1]);
                this.lights[i].setQuadraticAttenuation(light[6][2]);

                if (light[1] == "spot") {
                    let direction = [light[9][0] - light[2][0], light[9][1] - light[2][1], light[9][2] - light[2][2]];
                    // const normalize = Math.sqrt(direction[0] * direction[0] + direction[1] * direction[1] + direction[2] * direction[2]);
                    // direction = [direction[0] / normalize, direction[1] / normalize, direction[2] / normalize];

                    this.lights[i].setSpotCutOff(light[7]);
                    this.lights[i].setSpotExponent(light[8]);

                    //this.lights[i].setSpotDirection(light[9][0], light[9][1], light[9][2]);
                    this.lights[i].setSpotDirection(direction[0], direction[1], direction[2]);
                }

                this.lights[i].setVisible(this.displayLights);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }

    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }
    
    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.currCam = this.graph.defaultCam;
        this.setCamera(this.currCam);

        this.initLights();
        
        this.interface.addCameras();
        this.interface.addLights();
        this.interface.addHighlighted();

        this.sceneInited = true;
    }

    // Set the current camera
    setCamera = (cam) => {
        // Change the cameras
        this.camera = this.graph.views[cam];
        this.interface.setActiveCamera(this.camera);
    }

    updateAllLights() {
        for (let light of this.lights) {
            light.update();
        }
    }

    updateMaterials() {
        for (let key in this.graph.components) {
            this.graph.components[key].nextMaterial();
        }
    }

    resetAnims = () => {
        this.startTime = null;
        this.resetAnimations = true;
    }

    managePick = (mode, results) => {
        if (mode == false) {
            if (results != null && results.length > 0) {
                for (let i=0; i< results.length; i++) {
                    const obj = results[i][0];
                    if (obj) {
                        //const customId = results[i][1];
                        obj.onPick();
                    }
                }
                results.splice(0,results.length);
            }
        }
    }


    // called periodically (as per setUpdatePeriod() in init())
	update(t) {
        if (this.sceneInited) {
            if (this.startTime === null) this.startTime = t;
            for (let anim in this.graph.animations) {
                this.graph.animations[anim].update((t - this.startTime)/1000);
            }
        }
        if (this.checkers) {
            this.checkers.update(t);
        }
        // Dividing the time by 100 "slows down" the variation (i.e. in 100 ms timeFactor increases 1 unit).
        // Doing the modulus (%) by 100 makes the timeFactor loop between 0 and 99
        // ( so the loop period of timeFactor is 100 times 100 ms = 10s ; the actual animation loop depends on how timeFactor is used in the shader )
        const timeFactor = t / 100 % 1000;
        const sinFunc = Math.sin(timeFactor*0.1)*0.5+0.5;
        this.highlightedShader.setUniformsValues({ timeFactor: sinFunc});
	}

    /**
     * Displays the scene.
     */
    display() {
        this.managePick(this.pickMode, this.pickResults);

        this.clearPickRegistration();

        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        this.axis.display();

        if (this.sceneInited) {

            if (this.displayLights !== this.displayingLights) {
                this.displayingLights = this.displayLights;
                for (let light of this.lights)
                    light.setVisible(this.displayLights);
            }
            this.updateAllLights();

            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayNormals = this.displayNormals;
            
            if (this.info.initialMenu) {
                this.mainMenu.display();
            } else {
                if (this.checkers != null)
                    this.checkers.display();
                this.graph.displayScene();
                this.menu.display();
            }

            if (this.activeShader != this.defaultShader) this.setActiveShader(this.defaultShader);
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
        
    }

}