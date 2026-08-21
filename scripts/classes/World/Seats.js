import * as THREE from "three";

export default class Seats {
  constructor(world) {
    this.world = world;

    this.width = this.world.floor.width + 80;
    this.height = this.world.floor.height + 80;
    this.offset = this.world.floor.offset;
    this.rows = 20;

    this.setup();
  }

  setup() {
    this.group = new THREE.Group();

    const geometry = this.world.geometries.getSeat(1);
    const stepY = 7.5; // a line every 10 points;
    const stepX = this.width * 0.0125;
    const w = this.width;
    const h = this.height;

    for (let row = 1; row <= this.rows; row++) {
      let material;

      // Fade last 9
      if (row > this.rows - 10) {
        const diff = this.rows - row + 1;
        const opacity = diff / 10;
        material = this.world.materials.getSeat("#ced4f4", opacity);
      } else {
        material = this.world.materials.getSeat("#ced4f4", 1);
      }

      const gapX = stepX * row;
      const gapY = this.offset + stepY * (row + 2);

      const north = new THREE.Mesh(geometry, material);
      north.scale.x = w;
      north.scale.y = 1;
      north.position.x = -h / 2 - gapX;
      north.position.y = gapY;
      north.rotateY(Math.PI * 0.5);

      const east = new THREE.Mesh(geometry, material);
      east.scale.x = h;
      east.scale.y = 1;
      east.position.z = -w / 2 - gapX;
      east.position.y = gapY;
      east.rotateY(Math.PI * 0);

      const south = new THREE.Mesh(geometry, material);
      south.scale.x = w;
      south.scale.y = 1;
      south.position.x = h / 2 + gapX;
      south.position.y = gapY;
      south.rotateY(Math.PI * -0.5);

      const west = new THREE.Mesh(geometry, material);
      west.scale.x = h;
      west.scale.y = 1;
      west.position.z = w / 2 + gapX;
      west.position.y = gapY;
      west.rotateY(Math.PI);

      this.group.add(north, east, south, west);
    }

    this.world.scene.instance.add(this.group);

    // If #downloader mode is on, hide seats
    if (this.world.app.downloader.mode) {
      this.group.visible = false;
    }
  }

  update() {}
}
