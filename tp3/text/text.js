import { MyQuad } from "../components/MyQuad.js";
import { CGFshader, CGFtexture, CGFappearance } from "../../lib/CGF.js";

let textAppearance = null;
let fontTexture = null;
let textShader = null;
let quad = null;

/**
 * Writes a text on the scene
 * @param {*} scene where to write the text
 * @param {*} text text to be written
 */
export const writeText = (scene, text) => {
    const prevShader = scene.activeShader;
    // activate shader for rendering text characters
    scene.setActiveShaderSimple(textShader);
    // activate texture containing the font
    textAppearance.apply();

    for (let i = 0; i < text.length; i++) {
        scene.activeShader.setUniformsValues({'charCoords': [text.charCodeAt(i) % 16, Math.floor(text.charCodeAt(i) / 16)]});
        quad.display();
        scene.translate(0.7, 0, 0);
    }
    scene.setActiveShader(prevShader);
}

/**
 * Initializes text appearance, texture and shaders.
 * Initializes the primitive MyQuad used to render the text. 
 */
export const initText = (scene) => {
    // font texture: 16 x 16 characters
    // http://jens.ayton.se/oolite/files/font-tests/rgba/oolite-font.png
    fontTexture = new CGFtexture(scene, "scenes/images/oolite-font.trans.png");
    textAppearance = new CGFappearance(scene);
    textAppearance.setTexture(fontTexture);

    // plane where texture character will be rendered
    quad = new MyQuad(scene);

    // instatiate text shader (used to simplify access via row/column coordinates)
    // check the two files to see how it is done
    textShader = new CGFshader(scene.gl, "shaders/font.vert", "shaders/font.frag");

    // set number of rows and columns in font texture
    textShader.setUniformsValues({ 'dims': [16, 16] })//, 'textColor': vec3.fromValues(0.0, 0.0, 0.0)});
}