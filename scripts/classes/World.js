import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default class World {
  constructor(app, canvas) {
    this.app = app;
    this.canvas = typeof canvas === "string" ? document.querySelector(canvas) : canvas;

    // Settings
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.frustum = 10;
    this.views = {
      bars: { theta: Math.PI * 0.5, phi: Math.PI * 0.5 },
      grid: { theta: Math.PI * 0.5, phi: 0 },
      lines: { theta: 0, phi: Math.PI * 0.5 },
      corner: { theta: Math.PI * 0.25, phi: Math.PI * 0.333 },
    };
    this.cameraDistanceFromOrigin = 24;
    this.isOrbitControlling = false;

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

  get currentView() {
    return this.views[this.app.filters.view];
  }

  updateDeltaTime(currentTime) {
    if (this.lastTime === undefined) {
      this.lastTime = 0;
    }
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
  }

  expDecay(a, b, decay = 12, deltaTime = this.deltaTime) {
    return b + (a - b) * Math.exp(-decay * deltaTime);
  }

  updateCameraPosition(target) {
    if (this.isOrbitControlling) {
      return;
    }

    target = target || this.currentView;

    const decay = 6;

    const spherical = new THREE.Spherical();
    spherical.setFromVector3(this.camera.position);
    const currentTheta = spherical.theta;
    const currentPhi = spherical.phi;

    const theta = this.expDecay(currentTheta, target.theta, decay);
    const phi = this.expDecay(currentPhi, target.phi, decay);

    this.camera.position.setFromSphericalCoords(this.cameraDistanceFromOrigin, phi, theta);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  setup() {
    // Canvas
    this.canvas = document.querySelector("canvas");

    // Scene
    this.scene = new THREE.Scene();

    // Objects
    const color = getComputedStyle(document.body).getPropertyValue("--accent");
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const material = new THREE.MeshBasicMaterial({ color: color, wireframe: true });

    // Materials for each face
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xff0000 }), // red
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // green
      new THREE.MeshBasicMaterial({ color: 0x0000ff }), // blue
      new THREE.MeshBasicMaterial({ color: 0xffff00 }), // yellow
      new THREE.MeshBasicMaterial({ color: 0xff00ff }), // magenta
      new THREE.MeshBasicMaterial({ color: 0x00ffff }), // cyan
    ];

    this.mesh = new THREE.Mesh(geometry, materials);
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
    // this.camera.position.z = 3;

    // Set initial camera position
    this.camera.position.setFromSphericalCoords(
      this.cameraDistanceFromOrigin,
      this.currentView.phi,
      this.currentView.theta
    );
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    // this.moveCameraTo(this.currentView);
    this.scene.add(this.camera);

    // Orbit controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.addEventListener("start", () => {
      this.isOrbitControlling = true;
    });

    // this.controls.update();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.render(this.scene, this.camera);

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
    this.updateDeltaTime(ms);
    this.updateCameraPosition();
    this.controls.update();

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame((ms) => this.update(ms));
  }
}
