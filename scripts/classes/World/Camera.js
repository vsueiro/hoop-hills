import * as THREE from "three";

export default class Camera {
  constructor(world) {
    this.world = world;

    this.distance = 24;
    this.frustum = 10;
    this.near = 1;
    this.far = 2000;

    this.isUserRotating = false;

    this.views = {
      bars: { theta: Math.PI * 0.5, phi: Math.PI * 0.5 },
      grid: { theta: Math.PI * 0.5, phi: 0 },
      lines: { theta: 0, phi: Math.PI * 0.5 },
      corner: { theta: Math.PI * 0.25, phi: Math.PI * 0.333 },
    };

    this.setup();
  }

  get aspect() {
    return this.world.width / this.world.height;
  }

  get left() {
    return this.frustum * this.aspect * -0.5;
  }

  get right() {
    return this.frustum * this.aspect * 0.5;
  }

  get top() {
    return this.frustum * 0.5;
  }

  get bottom() {
    return this.frustum * -0.5;
  }

  get targetView() {
    return this.views[this.world.app.filters.view];
  }

  get currentView() {
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(this.instance.position);
    return spherical;
  }

  get origin() {
    return new THREE.Vector3(0, 0, 0);
  }

  resize() {
    this.instance.aspect = this.aspect;
    this.instance.left = this.left;
    this.instance.right = this.right;
    this.instance.top = this.top;
    this.instance.bottom = this.bottom;
    this.instance.updateProjectionMatrix();
  }

  setup() {
    this.instance = new THREE.OrthographicCamera(this.left, this.right, this.top, this.bottom, this.near, this.far);
    this.instance.position.setFromSphericalCoords(this.distance, this.targetView.phi, this.targetView.theta);
    this.instance.lookAt(this.origin);
    this.world.scene.instance.add(this.instance);
  }

  expDecay(a, b, decay = 6, deltaTime = this.world.deltaTime) {
    return b + (a - b) * Math.exp(-decay * deltaTime);
  }

  updatePosition() {
    if (this.isUserRotating) {
      return;
    }

    const target = this.targetView;
    const current = this.currentView;

    const theta = this.expDecay(current.theta, target.theta);
    const phi = this.expDecay(current.phi, target.phi);

    this.instance.position.setFromSphericalCoords(this.distance, phi, theta);
    this.instance.lookAt(this.origin);
  }

  update() {
    this.updatePosition();
  }
}
