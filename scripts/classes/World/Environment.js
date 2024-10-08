import * as THREE from "three";

export default class Environment {
  constructor(world) {
    this.world = world;

    this.texture = this.createGradientTexture();
    this.setup();
  }

  createGradientTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    const context = canvas.getContext("2d");

    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);

    const blue = this.world.palette.leading(0.333);
    const red = this.world.palette.trailing(0.666);
    const mixer = this.world.palette.interpolate(blue, red);

    gradient.addColorStop(0.4, mixer(0.05));
    gradient.addColorStop(0.6, mixer(0.25));

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // context.fillStyle = "rgba(128,128,128,.2)";
    // context.fillRect(0, 0, canvas.width, canvas.height);

    return new THREE.CanvasTexture(canvas);
  }

  setup() {
    const sphere = new THREE.SphereGeometry(1000, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.BackSide,
    });
    // Create the sphere mesh
    this.instance = new THREE.Mesh(sphere, material);
    // Add the sphere to the scene
    this.world.scene.instance.add(this.instance);
  }

  update() {}
}
