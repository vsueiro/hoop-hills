import * as THREE from "three";
import Hill from "./Hill.js";
import Shadow from "./Shadow.js";
// import Lines from "./Lines.js";

export default class Hills {
  constructor(world, games) {
    this.world = world;
    this.games = games;
    this.groups = [];
    this.lines = [];
    this.tags = [];

    this.depth = 2;
    this.gap = 0;
    this.widthPerSecond = 100 / 2880;
    this.heightPerPoint = 0.75;
    this.hideAll = true;

    this.depthOffset = this.getDepthOffset();

    this.setup();
  }

  getDepth(order) {
    return this.depth * 0.5 + (this.depth + this.gap) * order;
  }

  getDepthLines() {
    return this.getDepth(this.games.length - 1) + this.depth * 0.5 + this.getDepth(8);
  }

  getDepthOffset() {
    return (this.getDepth(this.games.length - 1) + this.depth * 0.5) * 0.5;
  }

  getWidth(seconds) {
    return this.widthPerSecond * seconds;
  }

  getWidthOffset(seconds) {
    return this.widthPerSecond * seconds * -0.5;
  }

  findByMost(property) {
    const pairs = {
      biggestTrail: "pointDifference",
      biggestLead: "pointDifference",
    };

    for (let group of this.groups) {
      if (group.userData.most[property] === false) {
        continue;
      }

      for (let hill of group.children) {
        const value = hill.userData[pairs[property]];

        if (value === group.userData[property]) {
          return hill;
        }
      }
    }

    return null;
  }

  createGroups() {
    for (let game of this.games) {
      const group = new THREE.Group();

      group.userData = game;
      group.position.z = 0;
      group.position.x = this.getWidthOffset(2880);

      this.groups.push(group);
      this.world.scene.instance.add(group);
    }
  }

  createHills() {
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

      // Check if the play lasted more than 0 seconds
      const duration = nextPlay.elapsedTime - play.elapsedTime;
      if (duration === 0) {
        continue;
      }

      const hill = new Hill(this.world, this, play, nextPlay);

      group.add(hill.mesh);
    }
  }

  createLines() {
    const depth = this.getDepthLines();
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const thickness = 0.2;

    const periods = [
      {
        seconds: 0,
        tag: "Q1",
      },
      {
        seconds: 720,
        tag: "Q2",
      },
      {
        seconds: 1440,
        tag: "Q3",
      },
      {
        seconds: 2160,
        tag: "Q4",
      },
      {
        seconds: 2880,
        tag: "OT",
      },
    ];

    for (let period of periods) {
      // Line
      const cylinder = new THREE.CylinderGeometry(thickness, thickness, depth, 8);
      const line = new THREE.Mesh(cylinder, lineMaterial);
      line.rotation.x = Math.PI * 0.5;
      line.position.x = this.getWidth(period.seconds) + this.getWidthOffset(2880);
      this.world.scene.instance.add(line);
      this.lines.push(line);

      // Tag
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const width = 512;
      const height = width * 0.25;
      canvas.width = width;
      canvas.height = height;

      // Ensure the canvas has a transparent background
      context.clearRect(0, 0, width, height);
      context.fillStyle = "rgba(0, 0, 0, 0)"; // Transparent background
      context.fillRect(0, 0, width, height);

      // Draw the text with a stroke
      context.fillStyle = "rgba(0,0,0,0)";
      context.strokeStyle = "rgba(0,0,0,.5)";
      context.lineWidth = 8;
      context.fillStyle = "white";
      context.font = "bold 72px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.strokeText(period.tag, width * 0.5, height * 0.5);
      context.fillText(period.tag, width * 0.5, height * 0.5);

      // Use the canvas as a texture
      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = this.world.renderer.instance.capabilities.getMaxAnisotropy(); // Apply anisotropic filtering
      texture.needsUpdate = true;

      const planeWidth = this.getWidth(720);
      const planeHeight = planeWidth * 0.25;

      // Create a plane geometry and apply the texture
      const plane = new THREE.PlaneGeometry(planeWidth, planeHeight);
      const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });

      const tag = new THREE.Mesh(plane, planeMaterial);
      tag.rotation.x = Math.PI * -0.5;
      tag.position.x = this.getWidth(period.seconds) + this.getWidthOffset(2880) + planeWidth * 0.5;
      tag.position.z = depth * 0.5 - planeHeight * 0.5;

      this.world.scene.instance.add(tag);
      this.tags.push(tag);
    }
  }

  createShadow() {
    const width = this.getWidth(2880);
    const height = this.getDepth(this.games.length - 1);

    this.shadow = new Shadow(this.world, width, height);
  }

  clear() {
    this.clearGroups();
    this.clearLines();
    this.clearShadow();
  }

  clearGroups() {
    for (let i = this.groups.length - 1; i >= 0; i--) {
      const group = this.groups[i];
      this.world.scene.instance.remove(group);
      this.groups.splice(i, 1);
    }
  }

  clearLines() {
    for (let i = this.lines.length - 1; i >= 0; i--) {
      const line = this.lines[i];
      this.world.scene.instance.remove(line);
      this.lines.splice(i, 1);
    }

    for (let i = this.tags.length - 1; i >= 0; i--) {
      const tag = this.tags[i];
      this.world.scene.instance.remove(tag);
      this.tags.splice(i, 1);
    }
  }

  clearShadow() {
    this.world.scene.instance.remove(this.shadow.instance);
  }

  expDecay(a, b, decay = 12, deltaTime = this.world.deltaTime) {
    return b + (a - b) * Math.exp(-decay * deltaTime);
  }

  show(hill) {
    hill.material.opacity = this.expDecay(hill.material.opacity, 1);
    hill.scale.y = this.expDecay(hill.scale.y, 1);
    hill.position.y = this.expDecay(hill.position.y, hill.userData.heightOffset);

    for (let child of hill.children) {
      if (child.isCSS2DObject) {
        child.element.style.opacity = 1;
      }
    }
  }

  hide(hill) {
    hill.material.opacity = this.expDecay(hill.material.opacity, this.hideAll ? 0.125 : 0.125);
    hill.scale.y = this.expDecay(hill.scale.y, 0);
    hill.position.y = this.expDecay(hill.position.y, 0);

    for (let child of hill.children) {
      if (child.isCSS2DObject) {
        child.element.style.opacity = 0;
      }
    }
  }

  highlight(filters = this.world.app.filters) {
    const some = {};

    some.opponent = !filters.isAll("opponent");
    some.games = !filters.isAll("games");
    some.results = !filters.isAll("results");
    some.periods = !filters.isAll("periods");

    for (let group of this.groups) {
      for (let hill of group.children) {
        let show = true;

        if (this.hideAll) {
          show = false;
        } else if (some.opponent && group.userData.opponent !== filters.opponent) {
          show = false;
        } else if (some.games && !filters.games.includes(group.userData.type)) {
          show = false;
        } else if (some.results && !filters.results.includes(group.userData.result)) {
          show = false;
        } else if (some.periods && !filters.periods.includes(hill.userData.period)) {
          show = false;
        }

        if (show) {
          this.show(hill);

          // Don’t check hover when rotating or zooming camera
          if (!this.world.camera.isUserControlling) {
            this.world.raycaster.intersects(hill);
          }
        } else {
          this.hide(hill);
        }
      }
    }

    // Hide label when rotating or zooming camera
    if (this.world.camera.isUserControlling) {
      this.world.labels.showDetails(null);
    } else {
      const hill = this.world.raycaster.hovered;
      this.world.labels.showDetails(hill);
    }
  }

  sort(filters = this.world.app.filters) {
    const property = filters.sorting === "margin" ? "orderByMargin" : "orderByDate";

    for (let group of this.groups) {
      const order = group.userData[property];
      const z = this.getDepth(order) - this.depthOffset;
      group.position.z = this.expDecay(group.position.z, z);
    }
  }

  setup() {
    this.createGroups();
    this.createHills();
    this.createLines();
    this.createShadow();
  }

  update() {
    this.highlight();
    this.sort();
  }
}
