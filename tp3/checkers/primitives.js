import { MyTorus } from '../components/MyTorus.js';
import { MyCylinder } from '../components/MyCylinder.js';
import { MyRectangle } from '../components/MyRectangle.js';
import { MyComponent } from '../components/MyComponent.js';

function buildCheckersTorus(scene) {
    const id = 'checkers-torus';
    scene.primitives[id] = new MyTorus(scene.scene, id, 0.2, 0.2, 10, 10);
    return id;
};
function buildCheckersCylinder(scene) {
    const id = 'checkers-cylinder';
    scene.primitives[id] = new MyCylinder(scene.scene, id, 0.3, 0.3, 0.4, 10, 4);
    return id;
};
export function buildCheckersRectangle(scene) {
    const id = 'checkers-rectangle';
    scene.primitives[id] = new MyRectangle(scene.scene, id, 0.0, 1.0, 0.0, 1.0);
    return id;
};

export function buildPieceComponent(scene) {
    const id = 'checkers-piece';
    const primitiveId = buildCheckersTorus(scene);
    let transfMatrix = mat4.create();
    mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0.5, 0.1, -0.5));
    mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
    scene.components[id] = new MyComponent(scene.scene, id, transfMatrix, ['inherit'], ['none', 1, 1], [[true, primitiveId]], null, null);
    return id;
}