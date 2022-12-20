import { MyTorus } from '../components/MyTorus.js';
import { MyCylinder } from '../components/MyCylinder.js';
import { MyRectangle } from '../components/MyRectangle.js';
import { MyComponent } from '../components/MyComponent.js';

function buildCheckersTorus(sceneGraph) {
    const id = 'checkers-torus';
    sceneGraph.primitives[id] = new MyTorus(sceneGraph.scene, id, 0.2, 0.2, 10, 10);
    return id;
};
function buildCheckersCylinder(sceneGraph) {
    const id = 'checkers-cylinder';
    sceneGraph.primitives[id] = new MyCylinder(sceneGraph.scene, id, 0.3, 0.3, 0.4, 10, 4);
    return id;
};
export function buildCheckersRectangle(sceneGraph) {
    const id = 'checkers-rectangle';
    sceneGraph.primitives[id] = new MyRectangle(sceneGraph.scene, id, 0.0, 1.0, 0.0, 1.0);
    return id;
};

export function buildPieceComponent(sceneGraph) {
    const id = 'checkers-piece';
    const primitiveId = buildCheckersTorus(sceneGraph);
    let transfMatrix = mat4.create();
    mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0.5, 0.1, -0.5));
    mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
    sceneGraph.components[id] = new MyComponent(sceneGraph.scene, id, transfMatrix, ['inherit'], ['none', 1, 1], [[true, primitiveId]], null, null);
    return id;
}