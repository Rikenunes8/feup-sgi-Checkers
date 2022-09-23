export class View {

  constructor(id, near, far, from, to) {
    this.id = id;
    this.near = near;
    this.far = far;
    this.from = from;  // array with [x, y, z]
    this.to = to;   // array with [x, y, z]
  }
}