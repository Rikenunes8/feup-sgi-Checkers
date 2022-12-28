import { MyQuad } from "../components/MyQuad.js";
import { CGFshader, CGFtexture, CGFappearance } from "../../lib/CGF.js";

export class Texter {
    constructor(scene) {
        this.scene = scene;
        this.initText();
    }

    /**
     * Initializes text appearance, texture and shaders.
     * Initializes the primitive MyQuad used to render the text. 
     */
    initText() {
        // font texture: 16 x 16 characters
        // http://jens.ayton.se/oolite/files/font-tests/rgba/oolite-font.png
        this.fontTexture = new CGFtexture(this.scene, "scenes/images/oolite-font.trans.png");
        this.textAppearance = new CGFappearance(this.scene);
        this.textAppearance.setTexture(this.fontTexture);

        // plane where texture character will be rendered
        this.quad = new MyQuad(this.scene);

        // instatiate text shader (used to simplify access via row/column coordinates)
        // check the two files to see how it is done
        this.textShader = new CGFshader(this.scene.gl, "shaders/font.vert", "shaders/font.frag");

        // set number of rows and columns in font texture
        this.textShader.setUniformsValues({ 'dims': [16, 16] })//, 'textColor': vec3.fromValues(0.0, 0.0, 0.0)});
    }

    /**
     * Writes a text on the scene
     * @param {*} text text to be written
     */
    writeText(text, spacing = 0.7) {
        const prevShader = this.scene.activeShader;
        // activate shader for rendering text characters
        this.scene.setActiveShaderSimple(this.textShader);
        // activate texture containing the font
        this.textAppearance.apply();

        for (let i = 0; i < text.length; i++) {
            this.scene.activeShader.setUniformsValues({'charCoords': [text.charCodeAt(i) % 16, Math.floor(text.charCodeAt(i) / 16)]});
            this.scene.activeShader.setUniformsValues({'textColor': vec4.fromValues(0.3, 0.3, 0.3, 1.0)});
            this.quad.display();
            this.scene.translate(spacing, 0, 0);
        }
        this.scene.setActiveShader(prevShader);
    }
}