import * as THREE from "three";

export default class Renderer {
  constructor(world) {
    this.world = world;
    this.setup();
  }

  get aspectRatio() {
    const canvas = this.instance.domElement;
    return canvas.width / canvas.height;
  }

  get pixelRatio() {
    // If on downloader mode, user 4 to get high-res images
    if (this.world.app.downloader.mode) {
      return 4;
    }

    // Otherwise, use the device’s pixel ratio, but cap it at 2
    return Math.min(window.devicePixelRatio, 2);
  }

  resize() {
    this.instance.setSize(this.world.width, this.world.height);
    this.instance.setPixelRatio(this.pixelRatio);

    this.world.idle.reset();
  }

  setup() {

    const options = { canvas: this.world.canvas };
    
    console.log(this.world.app.downloader.mode);

    // If we’re in #download mode
    if (this.world.app.downloader.mode) {
      // Enable drawingBuffer, based on https://stackoverflow.com/a/26475862
      options.preserveDrawingBuffer = true;
    }

    this.instance = new THREE.WebGLRenderer(options);
    this.instance.setClearColor(0x201853, 0);
    this.resize();
    this.update();
  }

  update() {
    this.instance.render(this.world.scene.instance, this.world.camera.instance);
  }
}
