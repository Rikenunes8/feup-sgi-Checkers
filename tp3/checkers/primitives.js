import { MyTorus } from '../components/MyTorus.js';
import { MyRectangle } from '../components/MyRectangle.js';
import { MyComponent } from '../components/MyComponent.js';

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
    sceneGraph.primitives[id] = new MyTorus(sceneGraph.scene, id, 0.2, 0.2, 10, 10);
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
 * Add a pawn and a king component to the scene graph.
 * @param {*} sceneGraph 
 * @returns Array with the ids of the pawn and king components, respectively
 */
export function buildPieceComponent(sceneGraph) {
    const pawnComponentId = buildPawnComponent(sceneGraph);
    const kingComponentId = buildKingComponent(sceneGraph, pawnComponentId);
    return [pawnComponentId, kingComponentId];
}

/**
 * Add a pawn component to the scene graph.
 * @param {*} sceneGraph 
 * @returns id of the pawn component
 */
function buildPawnComponent(sceneGraph) {
    const id = 'checkers-pawn';
    const primitiveId = buildCheckersTorus(sceneGraph);
    let transfMatrix = mat4.create();
    mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(0.5, 0.1, -0.5));
    mat4.rotateX(transfMatrix, transfMatrix, -Math.PI / 2);
    sceneGraph.components[id] = new MyComponent(sceneGraph.scene, id, transfMatrix, ['inherit'], ['none', 1, 1], [[true, primitiveId]], null, null);
    return id;
}

/**
 * Add a king component to the scene graph.
 * @param {*} sceneGraph 
 * @param {*} pawnComponentId id of the pawn component
 * @returns id of the king component
 */
function buildKingComponent(sceneGraph, pawnComponentId) {
    const pawnComponentId2 = 'checkers-pawn2';
    let transfMatrix2 = mat4.create();
    mat4.translate(transfMatrix2, transfMatrix2, vec3.fromValues(0, 0.4, 0));
    sceneGraph.components[pawnComponentId2] = new MyComponent(sceneGraph.scene, pawnComponentId2, transfMatrix2, ['inherit'], ['none', 1, 1], [[false, pawnComponentId]], null, null);

    const id = 'checkers-king';
    let transfMatrix = mat4.create();
    sceneGraph.components[id] = new MyComponent(sceneGraph.scene, id, transfMatrix, ['inherit'], ['none', 1, 1], [[false, pawnComponentId], [false, pawnComponentId2]], null, null);
    return id;
}