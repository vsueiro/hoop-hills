import * as THREE from "three";

export default class Raycaster {
  constructor(world) {
    this.world = world;

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
      this.instersections.push(result[0]);
    }
  }

  setup() {
    this.instance = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1, -1);

    window.addEventListener("mousemove", (event) => {
      this.mouse.x = (event.clientX / this.world.width) * 2 - 1;
      this.mouse.y = -(event.clientY / this.world.height) * 2 + 1;

      console.log(this.mouse);
    });
  }

  update() {
    this.instersections = [];

    this.instance.setFromCamera(this.mouse, this.world.camera.instance);
  }
}
