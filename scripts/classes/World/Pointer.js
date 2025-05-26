import * as THREE from "three";

export default class Pointer {
  constructor(world) {
    this.world = world;

    this.coords = new THREE.Vector2(-1, -1);

    this.downCoords = null;
    this.clickTolerance = 0.01;

    this.clicked = false;
    // this.pressed = false;

    this.setup();
  }

  updateCoords(event) {
    const { clientX, clientY } = event;
    const { width, height } = this.world;

    this.coords.x = (clientX / width) * 2 - 1;
    this.coords.y = -(clientY / height) * 2 + 1;
  }

  handleMove(event) {
    this.updateCoords(event);
  }

  handleDown(event) {
    this.updateCoords(event);

    this.downCoords = this.coords.clone();
  }

  handleUp(event) {
    if (this.downCoords === null) {
      return;
    }

    const distance = this.downCoords.distanceTo(this.coords);

    if (distance > this.clickTolerance) {
      return;
    }

    this.clicked = true;

    // this.pressed = false;
  }

  setup() {
    window.addEventListener("pointermove", (event) => {
      this.handleMove(event);
    });

    // window.addEventListener("click", (event) => {
    //   this.handleClick(event);
    // });

    window.addEventListener("pointerdown", (event) => {
      // Only respond to clicks on canvas, not other UI elements
      if (event.target === this.world.canvas) {
        this.handleDown(event);
        return;
      }

      this.downCoords = null;
    });

    window.addEventListener("pointerup", (event) => {
      this.handleUp(event);
    });
  }

  update() {
    // this.clicked = false;
  }
}
