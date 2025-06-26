import * as THREE from "three";

export default class Geometries {
  constructor(world) {
    this.world = world;

    this.hillDepth = 2;

    this.lines = {};
    this.hills = {};
    this.marks = {};
    this.seats = {};

    this.setup();
  }

  getLine(thickness = 0.2) {
    if (!this.lines[thickness]) {
      const segments = 8;
      const depth = 1; // To be scaled on mesh
      this.lines[thickness] = new THREE.CylinderGeometry(thickness, thickness, depth, segments);
    }

    return this.lines[thickness];
  }

  getHill(height) {
    if (!this.hills[height]) {
      const width = 1; // To be scale on mesh
      this.hills[height] = new THREE.BoxGeometry(width, height, this.hillDepth);
    }

    return this.hills[height];
  }

  getMark(height = 0.4) {
    if (!this.marks[height]) {
      const width = 0;

      this.marks[height] = new THREE.BoxGeometry(width, height, this.hillDepth);
    }

    return this.marks[height];
  }

  getSeat(side = 1) {
    if (!this.seats[side]) {
      this.seats[side] = new THREE.PlaneGeometry(side, side);
    }

    return this.seats[side];
  }

  setup() {}

  update() {}
}
