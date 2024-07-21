import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import DeltaTime from "./World/DeltaTime.js";
import Scene from "./World/Scene.js";
import Camera from "./World/Camera.js";

export default class World {
  constructor(app, canvas) {
    this.app = app;
    this.canvas = document.querySelector(canvas);

    // Settings
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.setup();
    requestAnimationFrame((ms) => this.update(ms));
  }

  get pixelRatio() {
    return Math.min(window.devicePixelRatio, 2);
  }

  expDecay(a, b, decay = 12, deltaTime = this.deltaTime) {
    return b + (a - b) * Math.exp(-decay * deltaTime);
  }

  setup() {
    this.deltaTime = new DeltaTime();

    this.scene = new Scene(this);
    this.camera = new Camera(this);
    // this.controls = new Controls(this);
    // this.renderer = new Renderer(this);

    // Objects
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xff0000 }), // red
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // green
      new THREE.MeshBasicMaterial({ color: 0x0000ff }), // blue
      new THREE.MeshBasicMaterial({ color: 0xffff00 }), // yellow
      new THREE.MeshBasicMaterial({ color: 0xff00ff }), // magenta
      new THREE.MeshBasicMaterial({ color: 0x00ffff }), // cyan
    ];

    this.mesh = new THREE.Mesh(geometry, materials);
    this.scene.instance.add(this.mesh);

    // Orbit controls
    this.controls = new OrbitControls(this.camera.instance, this.canvas);
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.addEventListener("start", () => {
      this.camera.isUserRotating = true;
    });

    // this.controls.update();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.render(this.scene.instance, this.camera.instance);

    window.addEventListener("resize", () => {
      this.resize();
    });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.resize();

    // this.controls.update();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.pixelRatio);
  }

  update(ms) {
    this.deltaTime.update(ms);

    this.scene.update();
    this.camera.update();
    // this.controls.update();
    // this.renderer.update();

    this.controls.update();

    this.renderer.render(this.scene.instance, this.camera.instance);

    requestAnimationFrame((ms) => this.update(ms));
  }
}
