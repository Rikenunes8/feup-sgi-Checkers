import {CGFobject} from "../lib/CGF.js";

export class MyTriangle extends CGFobject{
    constructor(scene, texCoords){
        super(scene);
        this.initBuffers(texCoords);
    }

    initBuffers(texCoords){
        if (texCoords) this.texCoords = texCoords;
		else this.texCoords = [
			0, 0,
			0, 1,
			1, 0,
			1, 1
		]

        this.vertices = [
            -1, 0, 0,   //0
            0, 1, 0,    //1
            1, 0, 0     //2
        ]

        this.vertices = this.vertices.concat(this.vertices);

        //Counter-clockwise reference of vertices
        this.indices = [ 
            0, 2, 1,
            4, 5, 3,
        ]

        this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
        ]

        //The defined indices (and corresponding vertices)
		//will be read in groups of three to draw triangles
        this.primitiveType = this.scene.gl.TRIANGLES;

        this.initGLBuffers();
    }
}