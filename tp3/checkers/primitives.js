import { MyTorus } from '../components/MyTorus.js';
import { MyRectangle } from '../components/MyRectangle.js';
import { MyComponent } from '../components/MyComponent.js';
import { MyPatch } from '../components/MyPatch.js';

/**
 * Radius of a piece component.
 */
export const pawnRadius = 0.4;

/**
 * Add a torus primitive to the scene graph.
 * @param {*} sceneGraph 
 * @returns id of the torus primitive
 */
function buildCheckersTorus(sceneGraph) {
    const id = 'checkers-torus';
    sceneGraph.primitives[id] = new MyTorus(sceneGraph.scene, id, 0.2, 0.2, 16, 32);
    return id;
};

/**
 * Add a rectangle primitive to the scene graph.
 * @param {*} sceneGraph 
 * @returns id of the rectangle primitive
 */
export function buildCheckersRectangle(sceneGraph) {
    const id = 'checkers-rectangle';
    sceneGraph.primitives[id] = new MyRectangle(sceneGraph.scene, id, 0.0, 1.0, 0.0, 1.0);
    return id;
};

/**
 * Add a rectangle patch primitive to the scene graph.
 * @param {*} sceneGraph 
 * @returns id of the rectangle patch primitive
 */
export function buildCheckersTile(sceneGraph) {
    const id = 'checkers-tile';
    sceneGraph.primitives[id] = new MyPatch(sceneGraph.scene, id, 1, 10, 1, 10, [[[0.0, 0.0, 0.0, 1.0], [0.0, 1.0, 0.0, 1.0]], [[1.0, 0.0, 0.0, 1.0], [1.0, 1.0, 0.0, 1.0]]]);
    return id;
};

/**
 * Add a piece component to the scene graph.
 * @param {*} sceneGraph 
 * @returns Id of the piece component
 */
export function buildPieceComponent(sceneGraph) {
    const id = 'checkers-piece';
    const primitiveId = buildCheckersTorus(sceneGraph);
    let transfMatrix = mat4.create();
    mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0.5, 0.1, -0.5));
    mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
    sceneGraph.components[id] = new MyComponent(sceneGraph.scene, id, transfMatrix, ['inherit'], ['none', 1, 1], [[true, primitiveId]], null, null);
    return id;
};
