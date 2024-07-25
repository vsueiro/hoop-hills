import * as THREE from "three";

export default class Mouse {
  constructor(world) {
    this.world = world;

    this.coords = new THREE.Vector2(-1, -1);

    this.clicked = false;
    this.pressed = false;

    this.setup();
  }

  handleMove(event) {
    const { clientX, clientY } = event;
    const { width, height } = this.world;

    this.coords.x = (clientX / width) * 2 - 1;
    this.coords.y = -(clientY / height) * 2 + 1;
  }

  handleDown() {
    this.clicked = true;
    this.pressed = true;
  }

  handleUp() {
    this.pressed = false;
  }

  setup() {
    window.addEventListener("mousemove", (event) => {
      this.handleMove(event);
    });

    window.addEventListener("mousedown", () => {
      this.handleDown();
    });

    window.addEventListener("mouseup", () => {
      this.handleUp();
    });
  }

  update() {
    this.clicked = false;
  }
}
