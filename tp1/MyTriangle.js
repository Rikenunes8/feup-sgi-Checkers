import {CGFobject} from "../lib/CGF.js";

export class MyTriangle extends CGFobject{
    constructor(scene, id, pos1, pos2, pos3){
        super(scene);
        this.pos1 = [...pos1];
        this.pos2 = [...pos2];
        this.pos3 = [...pos3];

        this.initBuffers();
    }

    initBuffers() {

        this.distA = Math.sqrt(Math.pow(this.pos2[0] - this.pos1[0], 2) + Math.pow(this.pos2[1] - this.pos1[1], 2) + Math.pow(this.pos2[2] - this.pos1[2], 2));
        this.distB = Math.sqrt(Math.pow(this.pos3[0] - this.pos2[0], 2) + Math.pow(this.pos3[1] - this.pos2[1], 2) + Math.pow(this.pos3[2] - this.pos2[2], 2));
        this.distC = Math.sqrt(Math.pow(this.pos1[0] - this.pos3[0], 2) + Math.pow(this.pos1[1] - this.pos3[1], 2) + Math.pow(this.pos1[2] - this.pos3[2], 2));

        this.cosA = (this.distA * this.distA - this.distB * this.distB + this.distC * this.distC) / (2 * this.distA * this.distC);
        // const cosB = (distA * distA + distB * distB - distC * distC) / (2 * distA * distB);
        // const cosY = (- distA * distA + distB * distB + distC * distC) / (2 * distB * distC);

        this.sinA = Math.sqrt(1 - this.cosA * this.cosA);

        this.vertices = [
            this.pos1[0], this.pos1[1], this.pos1[2], // 0
            this.pos2[0], this.pos2[1], this.pos2[2], // 1
            this.pos3[0], this.pos3[1], this.pos3[2], // 2
        ]

        //Counter-clockwise reference of vertices
        this.indices = [ 
            0, 1, 2,
        ]

        const vec12 = [this.pos2[0] - this.pos1[0], this.pos2[1] - this.pos1[1], this.pos2[2] - this.pos1[2]];
        const vec13 = [this.pos3[0] - this.pos1[0], this.pos3[1] - this.pos1[1], this.pos3[2] - this.pos1[2]];
        
        const normal = this.calculateNormal(vec12, vec13);

        this.normals = [
            normal[0], normal[1], normal[2],
            normal[0], normal[1], normal[2],
            normal[0], normal[1], normal[2],
        ]

        //The defined indices (and corresponding vertices)
		//will be read in groups of three to draw triangles
        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
    }

    /**
     * calculates the normal of two given vectors
     * @param {*} vec1 
     * @param {*} vec2 
     * @returns
     */
    calculateNormal(vec1, vec2) {
        let x = vec1[1] * vec2[2] - vec1[2] * vec2[1]
        let y = - (vec1[0] * vec2[2] - vec1[2] * vec2[0])
        let z = vec1[0] * vec2[1] - vec1[1] * vec2[0]
        let abs = Math.sqrt(x*x + y*y + z*z)
        return [x/abs, y/abs, z/abs];
    }

    setTexCoords(length_s, length_t) {
        this.texCoords = [
            0, 0,
            this.distA / length_s, 0,
            this.distC * this.cosA / length_s, -this.distC * this.sinA / length_t,
        ];
    }

    updateTexCoords(coords) {
        if (coords.length != 2) console.warn("Wrong number of coordinates")
		this.setTexCoords(coords[0], coords[1])
		this.updateTexCoordsGLBuffers();
	}
}