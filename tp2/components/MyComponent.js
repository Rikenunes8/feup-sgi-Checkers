import { CGFobject } from '../../lib/CGF.js';


export class MyComponent extends CGFobject {

    constructor(scene, id, transfMatrix, materials, texture, children, animation, highlighted) {
        super(scene);
        this.id = id;

        // transformation matrix
        this.transfMatrix = transfMatrix;

        // array with all the materials {CGFAppearance} or 'inherit'
        this.materials = [...materials];

        this.texture = texture;

        // children = [isPrimitive, id] => isPrimitive = bool; id = children component string
        this.children = [...children];

        this.animationId = animation != null ? animation[0] : null;

        this.highlighted = highlighted != null ? [...highlighted] : null; // [r="ff" g="ff" b="ff" scale_h="ff"]
        this.isHighlighted = false;
        this.material = 0;
    }

    /**
     * Increments the material index of the component.
     */
    nextMaterial() {
        this.material = (this.material + 1) % this.materials.length;
    }

    /**
     * Gets the current material of the component.
     * @returns {CGFappearance} The current material of the component.
     */
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
    

    /**
     * Get highlighted property
     * @returns highlighted property
     */
    getHighlighted() {
        if (this.isHighlighted) {
            return this.highlighted;
        }
    }
}
