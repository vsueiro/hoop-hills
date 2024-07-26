import * as THREE from "three";
import { interpolateBlues, interpolateReds } from "d3";

function normalize(value, min, max) {
  return (value - min) / (max - min);
}

export default class Hill {
  constructor(world, hills, play, nextPlay) {
    this.world = world;
    this.hills = hills;
    this.play = play;
    this.nextPlay = nextPlay;

    this.heightPerPoint = 0.5;

    this.setup();
  }

  setup() {
    const { play, nextPlay } = this;

    const duration = nextPlay.elapsedTime - play.elapsedTime;
    const width = duration * this.hills.widthPerSecond;
    const widthOffset = nextPlay.elapsedTime * this.hills.widthPerSecond + width * -0.5;
    const height = Math.abs(play.pointDifference) * this.hills.heightPerPoint;

    let color = "#808080";
    let heightOffset = 0;

    if (play.pointDifference > 0) {
      color = interpolateBlues(normalize(play.pointDifference, 50, 1));
      heightOffset = height * 0.5;
    } else if (play.pointDifference < 0) {
      color = interpolateReds(normalize(play.pointDifference, -50, 1));
      heightOffset = height * -0.5;
    }

    this.geometry = new THREE.BoxGeometry(width, height, this.hills.depth);
    this.material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0 });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.position.x = widthOffset;
    this.mesh.position.y = 0;
    this.mesh.scale.y = 0;

    // Store original color
    this.mesh.userData.color = color;

    // Store original y position
    this.mesh.userData.heightOffset = heightOffset;

    // Store point difference
    this.mesh.userData.pointDifference = play.pointDifference;

    // Store absolute team points
    this.mesh.userData.teamScore = play.teamScore;

    // Calculate period
    if (play.elapsedTime >= 2880) {
      this.mesh.userData.period = "OT";
    } else if (play.elapsedTime >= 2160) {
      this.mesh.userData.period = "Q4";
    } else if (play.elapsedTime >= 1440) {
      this.mesh.userData.period = "Q3";
    } else if (play.elapsedTime >= 720) {
      this.mesh.userData.period = "Q2";
    } else if (play.elapsedTime >= 0) {
      this.mesh.userData.period = "Q1";
    }
  }
}
