import * as THREE from "three";

export default class Materials {
  constructor(world) {
    this.world = world;

    this.basics = {};

    this.setup();
  }

  getBasic(color) {
    if (!this.basics[color]) {
      this.basics[color] = new THREE.MeshBasicMaterial({ color: color });
    }

    return this.basics[color];
  }

  setup() {}

  update() {}
}
