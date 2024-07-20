import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default class World {
  constructor(app, canvas) {
    this.app = app;
    this.canvas = typeof canvas === "string" ? document.querySelector(canvas) : canvas;

    // Settings
    this.frustum = 10;
    // this.fov = 75;

    // Sizes
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.setup();
    requestAnimationFrame((ms) => this.update(ms));
  }

  get aspect() {
    return this.width / this.height;
  }

  get pixelRatio() {
    return Math.min(window.devicePixelRatio, 2);
  }

  get halfFrustumWidth() {
    return this.frustum * this.aspect * 0.5;
  }

  get halfFrustumHeight() {
    return this.frustum * 0.5;
  }

  setup() {
    // Canvas
    this.canvas = document.querySelector("canvas");

    // Scene
    this.scene = new THREE.Scene();

    // Objects
    const color = getComputedStyle(document.body).getPropertyValue("--accent");
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    // Camera
    this.camera = new THREE.OrthographicCamera(
      -this.halfFrustumWidth,
      this.halfFrustumWidth,
      this.halfFrustumHeight,
      -this.halfFrustumHeight,
      1,
      2000
    );
    this.camera.position.z = 3;
    this.scene.add(this.camera);

    // Orbit controls
    this.controls = new OrbitControls(this.camera, this.canvas);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.render(this.scene, this.camera);
    // this.controls.update();

    window.addEventListener("resize", () => {
      this.resize();
    });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.aspect;

    this.camera.left = -this.halfFrustumWidth;
    this.camera.right = this.halfFrustumWidth;
    this.camera.top = this.halfFrustumHeight;
    this.camera.bottom = -this.halfFrustumHeight;
    this.camera.updateProjectionMatrix();

    // this.controls.update();

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.pixelRatio);
  }

  update(ms) {
    this.mesh.rotation.z = ms * 0.001;
    this.mesh.rotation.y = ms * 0.001;

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame((ms) => this.update(ms));
  }
}
