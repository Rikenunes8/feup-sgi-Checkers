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

        let theta = 0;
        let thetaIncrement = (2*Math.PI) / this.slices;
        let heightIncrement = this.height / this.stacks;
        let cosines = [];
        let sines = [];
        for (let i = 0; i < this.slices; i++) {
            cosines.push(Math.cos(theta));
            sines.push(Math.sin(theta));
            theta += thetaIncrement;
        }
        const c = (this.top - this.base)/this.height;
        const zDeclive = -Math.cos(Math.atan(this.height/(this.top-this.base))); 

        for (let i = 0; i <= this.stacks; i++) {
            const currHeight = i*heightIncrement;
            const currRadius = this.base + c*currHeight;
            for (let j = 0; j < this.slices; j++) {
                // Vertices coordinates
                const x = currRadius*cosines[j];
                const y = currRadius*sines[j];
                const z = currHeight;

                this.vertices.push(x, y, z);

                // Indices
                if (i < this.stacks) {
                    const curr = i * this.slices + j;
                    const next = curr + this.slices; // (i+1) * (this.slices) + j
                    
                    if (j == this.slices-1) {
                        this.indices.push(curr, curr - (this.slices-1), curr + 1);
                        this.indices.push(curr, curr + 1, next);
                    } else {
                        this.indices.push(curr, curr + 1, next + 1);
                        this.indices.push(curr, next + 1, next);
                    }
                }
                this.normals.push(x, y, zDeclive);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateBuffers(complexity) { // TODO what is this?
        this.slices = Math.round(complexity);

        this.initBuffers();
        this.initNormalVizBuffers();
    }

    toRad(angle) {
        return angle * Math.PI / 180;
    }
}