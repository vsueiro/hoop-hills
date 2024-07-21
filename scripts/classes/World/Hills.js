import * as THREE from "three";

export default class Hills {
  constructor(world) {
    this.world = world;

    this.width = 100; // should be proportional to game duration (>=2880s)
    this.height = 50; // should be proportional to biggest lead/trail (~60)
    this.depth = 200; // should be proportional to season duration (~82, 112 max)

    this.setup();
  }

  setup() {
    // Objects
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xff0000 }), // red
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // green
      new THREE.MeshBasicMaterial({ color: 0x0000ff }), // blue
      new THREE.MeshBasicMaterial({ color: 0xffff00 }), // yellow
      new THREE.MeshBasicMaterial({ color: 0xff00ff }), // magenta
      new THREE.MeshBasicMaterial({ color: 0x00ffff }), // cyan
    ];

    const mesh = new THREE.Mesh(geometry, materials);
    this.world.scene.instance.add(mesh);
  }

  update() {}
}
