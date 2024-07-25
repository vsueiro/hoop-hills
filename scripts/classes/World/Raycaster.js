import * as THREE from "three";

export default class Raycaster {
  constructor(world) {
    this.world = world;

    // this.previousHoveredHill = null
    this.instersections = [];

    this.setup();
  }

  get hovered() {
    if (this.instersections.length === 0) {
      return null;
    }
    return this.instersections.sort((a, b) => a.distance - b.distance)[0].object;
  }

  intersects(object) {
    const result = this.instance.intersectObject(object, false);

    if (result.length > 0) {
      this.instersections.push(...result);
    }
  }

  setup() {
    this.instance = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    window.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
  }

  update() {
    this.instersections = [];

    this.instance.setFromCamera(this.mouse, this.world.camera.instance);
  }
}
