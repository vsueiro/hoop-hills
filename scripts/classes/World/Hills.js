import * as THREE from "three";
import { interpolateBlues, interpolateReds } from "d3";

function normalize(value, min, max) {
  return (value - min) / (max - min);
}

export default class Hills {
  constructor(world, games) {
    this.world = world;
    this.games = games;
    this.groups = [];

    this.depth = 2;
    this.gap = 0.5;
    this.widthPerSecond = 100 / 2880;
    this.heightPerPoint = 0.5;

    // this.width = 100; // should be proportional to game duration (>=2880s)
    // this.height = 50; // should be proportional to biggest lead/trail (~60)
    // this.depth = 200; // should be proportional to season duration (~82, 112 max)

    this.depthOffset = this.getDepthOffset();

    this.setup();
  }

  getDepth(index) {
    return this.depth * 0.5 + (this.depth + this.gap) * index;
  }

  getDepthOffset() {
    return (this.getDepth(this.games.length - 1) + this.depth * 0.5) * 0.5;
  }

  createAxes() {
    const axesHelper = new THREE.AxesHelper(100);
    this.world.scene.instance.add(axesHelper);
  }

  createGroups() {
    for (let game of this.games) {
      const group = new THREE.Group();

      group.userData = game;
      group.position.z = this.getDepth(game.number) - this.depthOffset;
      group.position.x = this.widthPerSecond * 2880 * -0.5;

      this.groups.push(group);
      this.world.scene.instance.add(group);
    }
  }

  clear() {
    for (let i = this.world.scene.instance.children.length - 1; i >= 0; i--) {
      const child = this.world.scene.instance.children[i];

      if (this.groups.includes(child)) {
        this.world.scene.instance.remove(child);
      }
    }
  }

  setup() {
    this.createAxes();
    this.createGroups();

    let groupIndex = -1;
    let groupId;
    const plays = this.world.app.data.games;

    for (let [index, play] of plays.entries()) {
      // Update current game id and index
      if (play.id !== groupId) {
        groupId = play.id;
        groupIndex++;
      }

      // Get hills group
      const group = this.groups[groupIndex];

      // Check if a next play exists for the current game
      let nextPlay;

      if (plays[index + 1] && play.id === plays[index + 1].id) {
        nextPlay = plays[index + 1];
      } else {
        continue;
      }

      const duration = nextPlay.elapsedTime - play.elapsedTime;

      if (duration === 0) {
        continue;
      }

      const width = duration * this.widthPerSecond;
      const widthOffset = nextPlay.elapsedTime * this.widthPerSecond + width * -0.5;

      // TEMP: using absolute values instead of check if positive or negative
      const height = Math.abs(play.pointDifference) * this.heightPerPoint;

      let color = "#808080";
      let heightOffset = 0;

      if (play.pointDifference > 0) {
        color = interpolateBlues(normalize(play.pointDifference, 50, 1));
        heightOffset = height * 0.5;
      } else if (play.pointDifference < 0) {
        color = interpolateReds(normalize(play.pointDifference, -50, 1));
        heightOffset = height * -0.5;
      }

      const geometry = new THREE.BoxGeometry(width, height, this.depth);
      const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, depthWrite: false });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = widthOffset;
      mesh.position.y = heightOffset;

      group.add(mesh);
    }

    this.world.app.data.games.forEach((play) => {});
  }

  highlight(filters) {
    const show = 1;
    const hide = 0.025;

    for (let group of this.groups) {
      for (let hill of group.children) {
        hill.material.opacity = show;

        if (!filters.isAll("opponent")) {
          hill.material.opacity = group.userData.opponent === filters.opponent ? show : hide;
        }
      }
    }
  }

  update() {}
}
