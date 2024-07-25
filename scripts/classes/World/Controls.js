import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

export default class Controls {
  constructor(world) {
    this.world = world;
    this.setup();
  }

  setup() {
    // Orbit for smooth rotating
    this.orbitInstance = new OrbitControls(this.world.camera.instance, this.world.canvas);
    this.orbitInstance.enableRotate = true;
    this.orbitInstance.enableZoom = false;
    this.orbitInstance.enablePan = false;
    this.orbitInstance.enableDamping = true;
    this.orbitInstance.dampingFactor = 0.1;

    this.orbitInstance.addEventListener("start", () => {
      this.world.camera.isUserControlling = true;
    });

    // Trackball for smooth zooming
    this.trackallInstance = new TrackballControls(this.world.camera.instance, this.world.canvas);
    this.trackallInstance.noRotate = true;
    this.trackallInstance.noPan = true;
    this.trackallInstance.noZoom = false;
    this.trackallInstance.zoomSpeed = 2;
    this.trackallInstance.dynamicDampingFactor = 0.2;

    this.trackallInstance.addEventListener("start", () => {
      this.world.camera.isUserControlling = true;
    });
  }

  update() {
    const target = this.orbitInstance.target;
    this.orbitInstance.update();
    this.trackallInstance.target.set(target.x, target.y, target.z);
    this.trackallInstance.update();
  }
}
