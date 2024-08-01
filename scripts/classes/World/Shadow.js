import * as THREE from "three";

export default class Shadow {
  constructor(world, width = 50, height = 100) {
    this.world = world;
    this.width = width;
    this.height = height;
    this.path = "./shadow.png";
    this.offset = -60;
    this.setup();
  }

  setup() {
    this.texture = new THREE.TextureLoader().load(this.path);

    this.geometry = new THREE.PlaneGeometry(this.width, this.height);
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 0.666,
    });

    this.instance = new THREE.Mesh(this.geometry, this.material);
    this.instance.position.set(0, this.offset, 0);
    this.instance.rotation.x = -Math.PI * 0.5;
    this.world.scene.instance.add(this.instance);
  }

  update() {}
}
