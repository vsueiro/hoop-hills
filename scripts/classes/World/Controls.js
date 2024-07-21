import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default class Controls {
  constructor(world) {
    this.world = world;
    this.setup();
  }

  setup() {
    this.instance = new OrbitControls(this.world.camera.instance, this.world.canvas);
    this.instance.enableRotate = true;
    this.instance.enableZoom = true;
    this.instance.enablePan = false;
    this.instance.enableDamping = true;

    this.instance.addEventListener("start", () => {
      this.world.camera.isUserRotating = true;
    });
  }

  update() {
    this.instance.update();
  }
}
