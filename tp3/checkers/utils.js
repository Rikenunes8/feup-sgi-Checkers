export function displayGraph(sceneGraph, node, prevMaterial = null) {
    const isPrimitive = node[0];
    const nodeId = node[1];
    if (isPrimitive) {
        sceneGraph.primitives[nodeId].display();
    }
    else {
        const component = sceneGraph.components[nodeId];
        let materialId = component.getMaterial();
        if (materialId === 'inherit') materialId = prevMaterial;
        const material = sceneGraph.materials[materialId];

        sceneGraph.scene.pushMatrix();
        sceneGraph.scene.multMatrix(component.transfMatrix);

        for (let child of component.children) {
            material.apply();
            displayGraph(sceneGraph, child, materialId);
        }
        sceneGraph.scene.popMatrix();
    }
}

export function diff(p1, p2, coord) {
    return Math.abs(p2[coord] - p1[coord]);
}

/**
 * Writes a text on the scene
 * @param {*} scene where to write the text
 * @param {*} text text to be written
 */
export const writeText = (scene, text) => {
    for (let i = 0; i < text.length; i++) {
        scene.activeShader.setUniformsValues({'charCoords': [text.charCodeAt(i) % 16, Math.floor(text.charCodeAt(i) / 16)]});
        scene.quad.display();
        scene.translate(0.7, 0, 0);
    }
}
export function toArrIndex(row, col) {
    return (row * 8) + col;
}
