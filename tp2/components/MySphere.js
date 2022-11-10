import { CGFobject } from "../../lib/CGF.js";

export class MySphere extends CGFobject {
    constructor(scene, id, radius, slices, stacks) {
        super(scene);
        this.radius = radius;
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
        let thetaCosines = [];
        let thetaSines = [];
        let phi = 0;
        let phiIncrement = Math.PI / this.stacks;
        let phiCosines = [];
        let phiSines = [];

        for (let i = 0; i < this.slices+1; i++) {
            thetaCosines.push(Math.cos(theta));
            thetaSines.push(Math.sin(theta));
            theta += thetaIncrement;
        }
        for (let i = 0; i <= this.stacks; i++) {
            phiCosines.push(Math.cos(phi));
            phiSines.push(Math.sin(phi));
            phi += phiIncrement;
        }

        for (let i = 0; i <= this.stacks; i++) {
            for (let j = 0; j < this.slices+1; j++) {
                // Vertices coordinates
                const x = this.radius * phiSines[i] * thetaCosines[j];
                const y = this.radius * phiSines[i] * thetaSines[j];
                const z = -this.radius * phiCosines[i];

                this.vertices.push(x, y, z);

                // Indices
                if (i < this.stacks) {
                    const curr = i * (this.slices+1) + j;
                    const next = curr + (this.slices+1); // (i+1) * (this.slices) + j

                    if (j != this.slices) {
                        this.indices.push(curr, curr + 1, next + 1);
                        this.indices.push(curr, next + 1, next);
                    }
                }
                const norme = Math.sqrt(x * x + y * y + z * z); 
                this.normals.push(x/norme, y/norme, z/norme);
                this.texCoords.push(- j / this.slices, i / this.stacks)
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
    updateTexCoords(coords) {
		
	}
}
