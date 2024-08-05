import * as THREE from "three";

export default class Camera {
  constructor(world) {
    this.world = world;

    this.distance = 1000;
    this.frustum = 200;
    this.near = 1;
    this.far = 2000;
    this.snapTolerance = 0.1;

    this.isUserRotating = false;
    this.isUserZooming = false;

    this.views = {
      bars: { theta: Math.PI * 0.5, phi: Math.PI * 0.5, zoom: 1 },
      grid: { theta: 0, phi: 0, zoom: 0.8 },
      lines: { theta: 0, phi: Math.PI * 0.5, zoom: 1.5 },
      corner: { theta: Math.PI * 0.25, phi: Math.PI * 0.36, zoom: 1 },
    };

    this.setup();
  }

  get isUserControlling() {
    if (this.isUserRotating || this.isUserZooming) {
      return true;
    }

    return false;
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
    const value = this.world.app.filters.view;

    if (value === "user") {
      return null;
    }

    return this.views[value];
  }

  get currentView() {
    const spherical = new THREE.Spherical();
    spherical.setFromVector3(this.instance.position);

    const { theta, phi } = spherical;
    return { theta, phi };
  }

  get closestView() {
    const { theta, phi } = this.currentView;

    for (let key in this.views) {
      if (key === "corner") {
        continue;
      }

      const view = this.views[key];
      const isThetaClose = Math.abs(theta - view.theta) < this.snapTolerance;
      const isPhiClose = Math.abs(phi - view.phi) < this.snapTolerance;

      if (isThetaClose && isPhiClose) {
        return key;
      }
    }

    return null;
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
    this.instance.zoom = this.targetView.zoom;
    this.instance.lookAt(this.origin);
    this.world.scene.instance.add(this.instance);
  }

  expDecay(a, b, decay = 6, deltaTime = this.world.deltaTime) {
    return b + (a - b) * Math.exp(-decay * deltaTime);
  }

  updatePosition() {
    if (this.isUserControlling) {
      return;
    }

    const target = this.targetView;

    if (!target) {
      return;
    }

    const current = this.currentView;

    const theta = this.expDecay(current.theta, target.theta);
    const phi = this.expDecay(current.phi, target.phi);

    this.instance.position.setFromSphericalCoords(this.distance, phi, theta);

    const zoom = this.expDecay(this.instance.zoom, target.zoom);
    this.instance.zoom = zoom;

    this.instance.lookAt(this.origin);

    this.instance.updateProjectionMatrix();
  }

  snapToClosestView() {
    const closestView = this.closestView;

    if (closestView === null) {
      return;
    }

    this.world.app.filters.setView(closestView);
    this.world.app.filters.handleFormInput("view");
  }

  update() {
    this.updatePosition();
  }
}
