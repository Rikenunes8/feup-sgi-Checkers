import { CGFobject } from '../lib/CGF.js';

export class MyComponent extends CGFobject {
    constructor(scene, id, transfMatrix, materials, texture, children) {
        super(scene);
        this.id = id;
        this.transfMatrix = transfMatrix;
        this.materials = [...materials];
        this.texture = texture;
        this.children = [...children];
        this.material = 0;
    }

    getMaterial() {
        return this.materials[this.material];
    }

    /**
     * Returns the texture of the component.
     * @returns {[CGFtexture, length_s, length_t]}
     */
    getTexture() {
        return this.texture;
    }
}
