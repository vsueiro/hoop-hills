import * as THREE from "three";

export default class Renderer {
  constructor(world) {
    this.world = world;
    this.setup();
  }

  get pixelRatio() {
    return Math.min(window.devicePixelRatio, 2);
  }

  resize() {
    this.instance.setSize(this.world.width, this.world.height);
    this.instance.setPixelRatio(this.pixelRatio);
  }

  setup() {
    this.instance = new THREE.WebGLRenderer({ canvas: this.world.canvas });
    this.instance.setClearColor(0x000000, 0);
    this.resize();
    this.update();
  }

  update() {
    this.instance.render(this.world.scene.instance, this.world.camera.instance);
  }
}
