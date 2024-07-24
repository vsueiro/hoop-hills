import DeltaTime from "./World/DeltaTime.js";

import Scene from "./World/Scene.js";
import Camera from "./World/Camera.js";
import Controls from "./World/Controls.js";
import Renderer from "./World/Renderer.js";
import Renderer2D from "./World/Renderer2D.js";

import Games from "./World/Games.js";
import Hills from "./World/Hills.js";
import Labels from "./World/Labels.js";

export default class World {
  constructor(app, canvas, canvas2D) {
    this.app = app;
    this.canvas = document.querySelector(canvas);
    this.canvas2D = document.querySelector(canvas2D);

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
    this.renderer2D = new Renderer2D(this);

    this.labels = new Labels(this);

    window.addEventListener("resize", () => {
      this.resize();
    });

    requestAnimationFrame((ms) => this.update(ms));
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
    this.renderer2D.resize();
  }

  clear() {
    if (this.hills) {
      this.hills.clear();
    }
  }

  build() {
    setTimeout(() => {
      this.clear();

      this.games = new Games(this, this.app.data.games);
      this.hills = new Hills(this, this.games.summaries);

      setTimeout(() => {
        this.hills.hideAll = false;

        this.labels.addBiggestLead();
        this.labels.addBiggestTrail();
      }, 200);
    }, 200);
  }

  update(ms) {
    this.deltaTime.update(ms);

    this.scene.update();
    this.camera.update();
    this.controls.update();
    this.renderer.update();
    this.renderer2D.update();

    if (this.hills) {
      this.hills.update();
    }

    requestAnimationFrame((ms) => this.update(ms));
  }
}
