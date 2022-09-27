import {CGFobject} from "../lib/CGF.js";

export class MyTriangle extends CGFobject{
    constructor(scene, id, pos1, pos2, pos3, texCoords){
        super(scene);
        this.pos1 = [...pos1];
        this.pos2 = [...pos2];
        this.pos3 = [...pos3];

        this.initBuffers(texCoords);
    }

    initBuffers(texCoords) {

        const distA = Math.sqrt(Math.pow(this.pos2[0] - this.pos1[0], 2) + Math.pow(this.pos2[1] - this.pos1[1], 2) + Math.pow(this.pos2[2] - this.pos1[2], 2));
        const distB = Math.sqrt(Math.pow(this.pos3[0] - this.pos2[0], 2) + Math.pow(this.pos3[1] - this.pos2[1], 2) + Math.pow(this.pos3[2] - this.pos2[2], 2));
        const distC = Math.sqrt(Math.pow(this.pos1[0] - this.pos3[0], 2) + Math.pow(this.pos1[1] - this.pos3[1], 2) + Math.pow(this.pos1[2] - this.pos3[2], 2));

        const cosA = (distA * distA - distB * distB + distC * distC) / (2 * distA * distC);
        const cosB = (distA * distA + distB * distB - distC * distC) / (2 * distA * distB);
        const cosY = (- distA * distA + distB * distB + distC * distC) / (2 * distB * distC);

        const sinA = Math.sqrt(1 - cosA * cosA);

        // TO DO: receive length_u and length_v from the scene in the place of textCoords
        // (or just get it from the scene that we pass in constructor), and calculate 
        // textCoords
        const length_u = 1; // TO DO get from scene/constructor
        const length_v = 1;
        if (texCoords) this.texCoords = texCoords;
		else this.texCoords = [
			0, 0,
			distA / length_u, 0,
            distC * cosA / length_u, distC * sinA / length_v,
		]

        this.vertices = [
            this.pos1[0], this.pos1[1], this.pos1[2], // 0
            this.pos2[0], this.pos2[1], this.pos2[2], // 1
            this.pos3[0], this.pos3[1], this.pos3[2], // 2
        ]

        //Counter-clockwise reference of vertices
        // TO DO: ?? is this ok?
        this.indices = [ 
            0, 1, 2,
            2, 1, 0
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
        return [
            vec1[1] * vec2[2] - vec1[2] * vec2[1],
            - (vec1[0] * vec2[2] - vec1[2] * vec2[0]),
            vec1[0] * vec2[1] - vec1[1] * vec2[0]
        ];
    }
}