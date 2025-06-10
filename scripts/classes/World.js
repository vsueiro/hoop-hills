import DeltaTime from "./World/DeltaTime.js";
import Idle from "./World/Idle.js";
// import Scene from "./World/Scene.js"; // Removed
// import Camera from "./World/Camera.js"; // Removed
// import Controls from "./World/Controls.js"; // Removed
// import Renderer from "./World/Renderer.js"; // Removed
import Palette from "./World/Palette.js"; // Not explicitly asked to remove, but likely unused
import Materials from "./World/Materials.js"; // Not explicitly asked to remove, but likely unused
import Geometries from "./World/Geometries.js"; // Not explicitly asked to remove, but likely unused
import Environment from "./World/Environment.js"; // Not explicitly asked to remove, but likely unused
// import Renderer2D from "./World/Renderer2D.js"; // Removed
import Pointer from "./World/Pointer.js"; // Not explicitly asked to remove, but may be related to Raycaster
import Raycaster from "./World/Raycaster.js"; // Not explicitly asked to remove, but likely unused
import Summaries from "./World/Summaries.js"; // Not explicitly asked to remove, but Hills is gone
import Hills from "./World/Hills.js";
// import Labels from "./World/Labels.js"; // Removed as per new instructions
// import Tooltips from "./World/Tooltips.js"; // Removed as per new instructions
import Floor from "./World/Floor.js";
import ElectionChart from './ElectionChart.js';

export default class World {
  constructor(app /*, canvas, canvas2D */) { // canvas and canvas2D args removed
    this.app = app;
    // this.canvas = document.querySelector(canvas); // Removed
    // this.canvas2D = document.querySelector(canvas2D); // Removed

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
    this.idle = new Idle(this);
    // this.scene = new Scene(this); // Removed
    // this.camera = new Camera(this); // Removed
    // this.controls = new Controls(this); // Removed
    // this.renderer = new Renderer(this); // Removed
    // this.palette = new Palette(this);
    // this.materials = new Materials(this);
    // this.geometries = new Geometries(this);
    // this.environment = new Environment(this);
    // this.renderer2D = new Renderer2D(this); // Removed
    this.electionChart = new ElectionChart(this.app, '#election-chart-container');
    this.pointer = new Pointer(this); // Keeping for now, might be removed later if unused
    // this.raycaster = new Raycaster(this); // Keeping for now, might be removed later if unused
    // this.labels = new Labels(this); // Removed
    // this.tooltips = new Tooltips(this); // Removed
    // this.floor = new Floor(this);

    window.addEventListener("resize", () => {
      this.resize();
    });

    requestAnimationFrame((ms) => this.update(ms));
  }

  resize() {
    // this.camera.resize(); // Removed
    // this.renderer.resize(); // Removed
    // this.renderer2D.resize(); // Removed
  }

  clear() {
    if (this.hills) {
      this.hills.clear();
    }

    // this.labels.clear();
    // this.tooltips.clear();
  }

  build() {
    // this.summaries = new Summaries(this, this.app.data.games); // Commented out previously
    this.clear(); // Existing this.clear() call

    if (this.app.data && this.app.data.electionData) {
      this.electionChart.setData(this.app.data.electionData);
      this.electionChart.drawChart();
    } else {
      console.error('Election data not available in World.build');
    }

    // setTimeout(() => { // Commented out previously
    //   this.clear();
    //   this.idle.reset();
    //   // this.hills = new Hills(this, this.summaries.list);
    //   // setTimeout(() => {
    //   //   this.hills.hideAll = false;
    //   // }, 200);
    // }, 200);
  }

  update(ms) {
    this.deltaTime.update(ms);
    this.idle.update();

    if (this.idle.state === false) {
      // this.scene.update(); // Removed
      // this.camera.update(); // Removed
      // this.controls.update(); // Removed
      // this.renderer.update(); // Removed
      // this.renderer2D.update(); // Removed
      // this.materials.update();
      // this.geometries.update();
      this.pointer.update(); // Keeping for now
      // this.raycaster.update();
      // this.environment.update();
      // this.floor.update();

      if (this.hills) {
        this.hills.update(); // Hills itself is removed from build(), so this won't run effectively
      }

      // this.labels.update();
      // this.app.stats.update(); // Removed: Stats are now updated by Filters.js
    }

    requestAnimationFrame((ms) => this.update(ms));
  }
}
