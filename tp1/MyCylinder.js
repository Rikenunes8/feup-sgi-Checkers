import { CGFobject } from "../lib/CGF";

export class MyCylinder extends CGFobject {
    constructor(scene, radius, height, slices, stacks) {
        super(scene);
        this.radius = radius;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];

        let theta = 0;
        let thetaIncrement = (2*Math.PI) / this.slices;
        let heightIncrement = this.height / this.stacks;
        let cosines = [];
        let sines = [];
        for (let i = 0; i < this.slices; i++) {
            cosines.push(Math.cos(this.toRad(theta)));
            sines.push(Math.sin(this.toRad(theta)));
            theta += thetaIncrement;
        }
        for (let i = 0; i <= this.stacks; i++) {
            for (let j = 0; j <= this.slices; j++) {
                // Vertices coordinates
                const x = radius*cosines[j];
                const y = radius*sines[j];
                const z = i * heightIncrement;

                this.vertices.push(x, y, z);

                // Indices
                if (i < this.stacks && j < this.slices) {
                    const curr = i * (this.slices+1) + j;
                    const next = (i+1) * (this.slices+1) + j; // curr + (this.slices+1)
    
                    this.indices.push(curr, curr + 1, next + 1);
                    this.indices.push(curr, next + 1, next);
                }
                
                this.normals.push(x, y, 0); // TODO i think the vector must be normalized

            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    updateBuffers(complexity) {
        this.slices = Math.round(complexity);
        
        this.initBuffers();
        this.initNormalVizBuffers();
    }

    toRad(angle) {
        return angle * Math.PI / 180;
    }
}