import * as THREE from "three";

export default class Geometries {
  constructor(world) {
    this.world = world;

    this.setup();
  }

  getCylinder() {
    const thickness = 0.2;
    const depth = 1; // To be scaled on mesh
    const segments = 8;

    return new THREE.CylinderGeometry(thickness, thickness, depth, segments);
  }

  setup() {
    this.cylinder = this.getCylinder();
  }

  update() {}
}
