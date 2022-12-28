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
            material.setTexture(null);
            material.apply();
            displayGraph(sceneGraph, child, materialId);
        }
        sceneGraph.scene.popMatrix();
    }
}

export function diff(p1, p2, coord) {
    return Math.abs(p2[coord] - p1[coord]);
}

export function toArrIndex(row, col) {
    return (row * 8) + col;
}

export function bezier(out, a, b, c, d, t) {
    const [aX, bX, cX] = _bezierCoord(a, b, c, d, 0);
    const [aY, bY, cY] = _bezierCoord(a, b, c, d, 1);
    const [aZ, bZ, cZ] = _bezierCoord(a, b, c, d, 2);
      
    const x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + a[0];
    const y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + a[1];
    const z = (aZ * Math.pow(t, 3)) + (bZ * Math.pow(t, 2)) + (cZ * t) + a[2];

    out[0] = x; out[1] = y; out[2] = z;

    return [x, y, z];
}

function _bezierCoord(a, b, c, d, i) {
    const cX = 3 * (b[i] - a[i]);
    const bX = 3 * (c[i] - b[i]) - cX;
    const aX = d[i] - a[i] - cX - bX;
    return [aX, bX, cX];
}
