import { CGFobject } from '../lib/CGF.js';

export class MyComponent extends CGFobject {
    constructor(scene, id, transfMatrix, materials, textures, children) {
        super(scene);
        this.id = id;
        this.transfMatrix = transfMatrix;
        // TODO: Is there a problem on coping arrays?
        this.materials = materials;
        this.textures = textures;
        this.children = children;

    }
}
