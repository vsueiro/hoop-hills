import * as THREE from "three";

export default class Raycaster {
  constructor(world) {
    this.world = world;

    this.hovered = null;

    this.setup();
  }

  // get hovered() {
  //   if (this.instersections.length === 0) {
  //     return null;
  //   }

  //   const hill = this.instersections.sort((a, b) => a.distance - b.distance)[0].object;

  //   return hill === undefined ? null : hill;
  // }

  intersects(object) {
    const result = this.instance.intersectObject(object, false);

    if (result.length === 0) {
      return;
    }

    if (this.hovered === null) {
      this.hovered = result[0];
      return;
    }

    if (result[0].distance < this.hovered.distance) {
      this.hovered = result[0];
    }
  }

  setup() {
    this.instance = new THREE.Raycaster();
  }

  update() {
    this.hovered = null;

    this.instance.setFromCamera(this.world.mouse.coords, this.world.camera.instance);
  }
}
