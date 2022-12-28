/**
 * Writes a text on the scene
 * @param {*} scene where to write the text
 * @param {*} text text to be written
 */
export const writeText = (scene, text) => {
    const prevShader = scene.activeShader;
    // activate shader for rendering text characters
    scene.setActiveShaderSimple(scene.textShader);
    // activate texture containing the font
    scene.textAppearance.apply();

    for (let i = 0; i < text.length; i++) {
        scene.activeShader.setUniformsValues({'charCoords': [text.charCodeAt(i) % 16, Math.floor(text.charCodeAt(i) / 16)]});
        scene.quad.display();
        scene.translate(0.7, 0, 0);
    }
    scene.setActiveShader(prevShader);
}