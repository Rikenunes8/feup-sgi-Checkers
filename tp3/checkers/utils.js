export function displayGraph(scene, node, prevMaterial) {
    const isPrimitive = node[0];
    const nodeId = node[1];
    if (isPrimitive) {
        scene.primitives[nodeId].display();
    }
    else {
        const component = scene.components[nodeId];
        let materialId = component.getMaterial();
        if (materialId === 'inherit') materialId = prevMaterial;
        const material = scene.materials[materialId];

        scene.scene.pushMatrix();
        scene.scene.multMatrix(component.transfMatrix);

        for (let child of component.children) {
            material.apply();
            displayGraph(scene, child, materialId);
        }
        scene.scene.popMatrix();
    }
}

export function diff(p1, p2, coord) {
    return Math.abs(p2[coord] - p1[coord]);
}

export function encode(string) {
    const splits = string.split('-');
    if (splits.length !== 3) return -1;
    let number = '';
    if (splits[1].includes('tile')) {
        number += '1';
    }
    else if (splits[1].includes('piece')) {
        number += '2';
    }
    number += splits[2];

    return parseInt(number);
}