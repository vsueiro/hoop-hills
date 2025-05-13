import * as THREE from "three";

export default class Geometries {
  constructor(world) {
    this.world = world;

    this.cylinders = {};
    this.boxes = {};

    this.setup();
  }

  getCylinder() {
    const thickness = 0.2;
    const segments = 8;
    const depth = 1; // To be scaled on mesh

    return new THREE.CylinderGeometry(thickness, thickness, depth, segments);
  }

  getBox(height) {
    if (!this.boxes[height]) {
      const depth = 2;
      const width = 1; // To be scale on mesh

      this.boxes[height] = new THREE.BoxGeometry(width, height, depth);
    }

    return this.boxes[height];
  }

  setup() {
    this.cylinder = this.getCylinder();
    this.box = this.getBox();
  }

  update() {}
}
