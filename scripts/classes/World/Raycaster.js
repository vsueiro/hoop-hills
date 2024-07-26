import * as THREE from "three";

export default class Raycaster {
  constructor(world) {
    this.world = world;

    this.closest = null;

    this.setup();
  }

  get hovered() {
    return this.closest ? this.closest.object : null;
  }

  intersects(object) {
    const result = this.instance.intersectObject(object, false);

    if (result.length === 0) {
      return;
    }

    if (this.closest === null) {
      this.closest = result[0];
      return;
    }

    if (result[0].distance < this.closest.distance) {
      this.closest = result[0];
    }
  }

  setup() {
    this.instance = new THREE.Raycaster();
  }

  update() {
    this.closest = null;

    this.instance.setFromCamera(this.world.mouse.coords, this.world.camera.instance);
  }
}
