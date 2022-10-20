import { CGFobject } from "../lib/CGF.js";

export class MyCylinder extends CGFobject {
    constructor(scene, id, base, top, height, slices, stacks) {
        super(scene);
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        let theta = 0;
        let thetaIncrement = (2*Math.PI) / this.slices;
        let heightIncrement = this.height / this.stacks;
        let cosines = [];
        let sines = [];
        for (let i = 0; i < this.slices+1; i++) {
            cosines.push(Math.cos(theta));
            sines.push(Math.sin(theta));
            theta += thetaIncrement;
        }
        const c = (this.top - this.base)/this.height;
        const k = Math.tan(Math.PI/2 - Math.atan(this.height/(this.base-this.top)));

        for (let i = 0; i <= this.stacks; i++) {
            const currHeight = i*heightIncrement;
            const currRadius = this.base + c*currHeight;
            for (let j = 0; j < this.slices+1; j++) {
                // Vertices coordinates
                const x = currRadius*cosines[j];
                const y = currRadius*sines[j];
                const z = currHeight;

                this.vertices.push(x, y, z);

                // Indices
                if (i < this.stacks) {
                    const curr = i * (this.slices+1) + j;
                    const next = curr + (this.slices+1); // (i+1) * (this.slices+1) + j
                    
                    if (j != this.slices) {
                        this.indices.push(curr, curr + 1, next + 1);
                        this.indices.push(curr, next + 1, next);
                    }
                }
                const zDeclive = Math.sqrt(x*x + y*y) * k;
                let abs = Math.sqrt(x*x + y*y + zDeclive*zDeclive)
                this.normals.push(x/abs, y/abs, zDeclive/abs);
                this.texCoords.push(-j / this.slices, i / this.height)
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateTexCoords(coords) {
		
	}

    /**
     * Converts degrees angle to radians.
     * @param {*} angle 
     * @returns angle in radians
     */
    toRad(angle) {
        return angle * Math.PI / 180;
    }
}
