import * as THREE from "three";

export default class Floor {
  constructor(world, width = 800) {
    this.world = world;
    this.width = width;
    this.height = this.width / (16 / 9);
    this.path = "./media/nba-court.png";
    this.offset = -60;
    this.tweak = 0.25;

    this.court;
    this.sidelines = [];
    this.sidelineCanvas;

    this.sidelineOptions = {
      width: 256,
      ratio: 1 / 2,
      repeat: 10,
    };

    this.team = this.world.app.filters.team;

    this.setup();
  }

  createCourt() {
    const texture = new THREE.TextureLoader().load(this.path);
    const geometry = new THREE.PlaneGeometry(this.width, this.height);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.666 * 0.1,
    });

    this.court = new THREE.Mesh(geometry, material);
    this.court.position.set(0, this.offset - this.tweak, 0);
    this.court.rotation.z = Math.PI * 0.5;
    this.court.rotation.x = -Math.PI * 0.5;
    this.world.scene.instance.add(this.court);

    // If #downloader mode is on, hide court
    if (this.world.app.downloader.mode) {
      this.court.visible = false;
    }
  }

  createTexture() {
    const { width, ratio, repeat } = this.sidelineOptions;
    const height = width * ratio;
    const x = width / 2;
    const y = height / 2;

    this.sidelineCanvas = document.createElement("canvas");
    this.sidelineCanvas.width = width;
    this.sidelineCanvas.height = height;
    const ctx = this.sidelineCanvas.getContext("2d");

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#3F3772";
    ctx.font = "bold 96px Outfit";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(this.world.app.filters.team, x, y);

    const texture = new THREE.CanvasTexture(this.sidelineCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(repeat, 1);
    texture.anisotropy = 16;

    return texture;
  }

  createSideline() {
    const texture = this.createTexture();
    const { repeat } = this.sidelineOptions;

    const height = (this.width / repeat) * (1 / 2);
    const geometry = new THREE.PlaneGeometry(this.width, height);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.05 });

    [-1, +1].forEach((direction) => {
      const sideline = new THREE.Mesh(geometry, material);
      const x = this.height * (0.5 * direction) + height * (0.5 * direction);
      sideline.position.y;
      sideline.position.set(x, this.offset, 0);
      sideline.rotation.z = Math.PI * (-0.5 * direction);
      sideline.rotation.x = -Math.PI * 0.5;
      this.world.scene.instance.add(sideline);

      // If #downloader mode is on, hide sidelines
      if (this.world.app.downloader.mode) {
        sideline.visible = false;
      }

      this.sidelines.push(sideline);
    });
  }

  updateSideline() {
    if (this.team === this.world.app.filters.team) {
      return;
    }

    const texture = this.createTexture();
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.05 });

    this.sidelines.forEach((sideline) => {
      sideline.material = material;
    });

    this.team = this.world.app.filters.team;
  }

  setup() {
    this.fontface = new FontFace("Outfit", "url(./Outfit-Bold.ttf)");

    this.fontface.load().then(() => {
      this.createCourt();
      this.createSideline();
    });
  }

  update() {
    this.updateSideline();
  }
}
