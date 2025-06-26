import * as THREE from "three";

export default class Materials {
  constructor(world) {
    this.world = world;

    this.basics = {};
    this.hills = {}; // hills[color][opacity]
    this.seats = {}; // seats[color][opacity]

    this.setup();
  }

  getHill(color, opacity = 1) {
    const opacitySteps = 16;
    const opacityStep = 1 / opacitySteps;

    if (!this.hills[color]) {
      this.hills[color] = {};

      // Add 16 + 1 levels of opacity (0, .0625, .125, .1875, .25, …, 1)
      for (let opacity = 0; opacity <= 1; opacity += opacityStep) {
        this.hills[color][opacity] = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
      }
    }

    const opacityKey = Math.round(opacity / opacityStep) * opacityStep;
    return this.hills[color][opacityKey];
  }

  getSeat(color, opacity = 1) {
    const opacitySteps = 16;
    const opacityStep = 1 / opacitySteps;

    if (!this.seats[color]) {
      this.seats[color] = {};

      // Add 16 + 1 levels of opacity (0, .0625, .125, .1875, .25, …, 1)
      for (let opacity = 0; opacity <= 1; opacity += opacityStep) {
        this.seats[color][opacity] = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity,
          side: THREE.FrontSide,
        });
      }
    }

    const opacityKey = Math.round(opacity / opacityStep) * opacityStep;
    return this.seats[color][opacityKey];
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
