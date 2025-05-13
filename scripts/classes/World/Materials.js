import * as THREE from "three";

export default class Materials {
  constructor(world) {
    this.world = world;

    this.basics = {};
    this.hills = {}; // hills[color][opacity]

    this.opacitySteps = 16;
    this.opacityStep = 1 / this.opacitySteps;

    for (let opacity = 0; opacity <= 1; opacity += this.opacityStep) {
      console.log(opacity);
    }

    this.setup();
  }

  getHill(color, opacity = 1) {
    if (!this.hills[color]) {
      this.hills[color] = {};

      // Add 16 + 1 levels of opacity (0, .0625, .125, .1875, .25, …, 1)
      for (let opacity = 0; opacity <= 1; opacity += this.opacityStep) {
        this.hills[color][opacity] = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
      }
    }

    const opacityKey = Math.round(opacity / this.opacityStep) * this.opacityStep;
    return this.hills[color][opacityKey];
  }

  getBasic(color) {
    if (!this.basics[color]) {
      this.basics[color] = new THREE.MeshBasicMaterial({ color: color });
    }

    return this.basics[color];
  }

  setup() {}

  update() {}
}
