import { CGFobject } from '../lib/CGF.js';

export class MyComponent extends CGFobject {
    constructor(scene, id, transfMatrix, materials, texture, children) {
        super(scene);
        this.id = id;
        this.transfMatrix = transfMatrix;
        this.materials = [...materials];
        this.texture = texture;
        this.children = [...children];
    }
}
