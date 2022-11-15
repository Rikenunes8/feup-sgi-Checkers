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

		this.init();
		this.initBuffers();
	}

	init() {
		let nurbsSurface = new CGFnurbsSurface(this.degree_u, this.degree_v, this.controlPoints);
		this.obj = new CGFnurbsObject(this.scene, this.parts_u, this.parts_v, nurbsSurface);
	}

	initBuffers() {
		this.obj.initBuffers();
	}
	

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
	}

	getControlPoints() {
		return this.controlPoints;
	}

	display() {
		this.obj.display();
	}

	enableNormalViz() {
		this.obj.enableNormalViz();
	}

	disableNormalViz() {
		this.obj.disableNormalViz();
	}


}

