export class View {

  constructor(id, near, far, from, to) {
    if (this.constructor == View) {
      throw new Error("Abstract classes can't be instantiated.");
    }

    this.id = id;
    this.near = near;
    this.far = far;
    this.from = from;  // array with [x, y, z]
    this.to = to;   // array with [x, y, z]
  }


  getCamera() { }

}