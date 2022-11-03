import { CGFnurbsObject, CGFnurbsSurface, CGFobject } from '../../lib/CGF.js';
/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
export class MyPatch extends CGFobject {
  constructor(scene, id, degree_u, parts_u, degree_v, parts_v, controlPoints) {

		super(scene);
		this.degree_u = degree_u;
		this.parts_u = parts_u;
		this.degree_v = degree_v;
		this.parts_v = parts_v;
		this.controlPoints = controlPoints;

		this.initBuffers();
	}

	/*initBuffers() {
		this.surface = null;

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}*/


	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}

	getControlPoints() {
		return this.controlPoints;
	}

	makeSurface(translation) {
			
		var nurbsSurface = new CGFnurbsSurface(this.degree_u, this.degree_v, this.controlPoints);

		var obj = new CGFnurbsObject(this, this.parts_u, this.parts_v, nurbsSurface); // must provide an object with the function getPoint(u, v) (CGFnurbsSurface has it)

		this.surface = obj;	
		this.translations.push(translation);
	}
}

