import DeltaTime from "./World/DeltaTime.js";
import Scene from "./World/Scene.js";
import Camera from "./World/Camera.js";
import Controls from "./World/Controls.js";
import Renderer from "./World/Renderer.js";
import Hills from "./World/Hills.js";

export default class World {
  constructor(app, canvas) {
    this.app = app;
    this.canvas = document.querySelector(canvas);

    this.setup();
  }

  get width() {
    return window.innerWidth;
  }

  get height() {
    return window.innerHeight;
  }

  setup() {
    this.deltaTime = new DeltaTime();

    this.scene = new Scene(this);
    this.camera = new Camera(this);
    this.controls = new Controls(this);
    this.renderer = new Renderer(this);

    this.hills = new Hills(this);

    window.addEventListener("resize", () => {
      this.resize();
    });

    requestAnimationFrame((ms) => this.update(ms));
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update(ms) {
    this.deltaTime.update(ms);

    this.scene.update();
    this.camera.update();
    this.controls.update();
    this.renderer.update();

    requestAnimationFrame((ms) => this.update(ms));
  }
}
