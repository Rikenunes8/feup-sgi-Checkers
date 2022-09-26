import {CGFobject} from "../lib/CGF.js";
import { DEGREE_TO_RAD } from "./MySceneGraph.js";

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
        const vec21 = [-vec12[0], -vec12[1], -vec12[2]];
        const vec23 = [this.pos3[0] - this.pos2[0], this.pos3[1] - this.pos2[1], this.pos3[2] - this.pos2[2]];
        const vec31 = [-vec13[0], -vec13[1], -vec13[2]];
        const vec32 = [-vec23[0], -vec23[1], -vec23[2]];
        
        const normal1 = this.calculateNormal(vec12, vec13);
        const normal2 = this.calculateNormal(vec21, vec23);
        const normal3 = this.calculateNormal(vec31, vec32);

        this.normals = [
            normal1[0], normal1[1], normal1[2],
            normal2[0], normal2[1], normal2[2],
            normal3[0], normal3[1], normal3[2],
        ]

        console.log("NORMAL: ", this.normals);

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