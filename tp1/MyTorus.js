import { CGFobject } from "../lib/CGF.js";

export class MyTorus extends CGFobject {
    constructor(scene, id, inner, outter, slices, loops) {
        super(scene);
        this.inner = inner;
        this.outter = outter;
        this.slices = slices;
        this.loops = loops;

        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];


        const thetaAngles = this.getCosinesAndSines(this.slices);
        const alphaAngles = this.getCosinesAndSines(this.loops);
        const thetaCosines = thetaAngles[0];
        const thetaSines = thetaAngles[1];
        const alphaSines = alphaAngles[0];
        const alphaCosines = alphaAngles[1];

        thetaCosines.push(thetaCosines[0])
        thetaSines.push(thetaSines[0])
        alphaSines.push(alphaSines[0])
        alphaCosines.push(alphaCosines[0])

        
        for (let i = 0; i < this.loops+1; i++) {
            const k1 = this.outter * alphaCosines[i];
            const k2 = this.outter * alphaSines[i];
            for (let j = 0; j < this.slices+1; j++) {
                // Vertices coordinates
                const x = k1 + this.inner*thetaCosines[j] * alphaCosines[i];
                const y = k2 + this.inner*thetaCosines[j] * alphaSines[i];
                const z = this.inner*thetaSines[j];

                this.vertices.push(x, y, z);
                
                // Indices
                const curr = i * (this.slices+1) + j;
                const next = curr + (this.slices+1); // (i+1) * (this.slices+1) + j
                if (i != this.loops) {
                    if (j != this.slices) {
                        this.indices.push(curr, curr + 1, next + 1);
                        this.indices.push(curr, next + 1, next);
                    }
                }
                let abs = Math.sqrt(Math.pow(x-k1, 2) + Math.pow(y-k2, 2)+ Math.pow(z, 2))
                this.normals.push((x-k1)/abs, (y-k2)/abs, z/abs);
                this.texCoords.push(- j / this.slices, i / this.loops);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
     * return the sines and cossines of n partitions of a circle
     * @param {*} n 
     * @returns [sines, cossines], where sines and cossines are arrays
     */
    getCosinesAndSines(n) {
        let angle = 0;
        let angleIncrement = (2*Math.PI) / n;
        let cosines = [];
        let sines = [];
        for (let i = 0; i < n; i++) {
            cosines.push(Math.cos(angle));
            sines.push(Math.sin(angle));
            angle += angleIncrement;
        }
        return [[...sines], [...cosines]];
    }

    updateTexCoords(coords) {
	}
}
