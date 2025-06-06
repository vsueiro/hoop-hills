import * as THREE from "three";
import Hill from "./Hill.js";
import Shadow from "./Shadow.js";

export default class Hills {
  constructor(world, games) {
    this.world = world;
    this.games = games;
    this.lines = [];
    this.groups = [];
    this.highlightedGroups = new Set();

    this.depth = this.world.geometries.hillDepth;
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

  findByAnnotation(property) {
    const annotation = this.world.summaries.annotations[property];

    if ("hill" in annotation && annotation.hill) {
      return annotation.hill;
    }

    switch (property) {
      case "biggestLead":
      case "biggestTrail":
      case "biggestComeback":
        if (annotation.id && annotation.value !== 0) {
          const group = this.groups.find((group) => group.userData.id === annotation.id);
          const hill = group.children.findLast((child) => child.userData.pointDifference === annotation.value);
          annotation.hill = hill;
          return { hill };
        }
      case "mostLeadChanges":
        if (annotation.id && annotation.value !== 0) {
          const group = this.groups.find((group) => group.userData.id === annotation.id);
          const hill = group.children.findLast((child) => child.userData.isLastPlay);
          annotation.hill = hill;
          return { hill };
        }
      default:
        return { hill: null };
    }
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

      // Try to access next play
      let nextPlay = plays[index + 1];

      // If this is the last play of the game
      const isLastPlay = !nextPlay || play.id !== nextPlay.id;
      if (isLastPlay) {
        // Check for buzzer beater
        if (group.userData.buzzerBeater) {
          // Pretend next play lasted 1s after clock expired
          nextPlay = { elapsedTime: play.elapsedTime + 1 };
          const hill = new Hill(this.world, this, play, nextPlay);
          group.add(hill.mesh);
        }

        continue;
      }

      // If play lasted more than 0 seconds
      const duration = nextPlay.elapsedTime - play.elapsedTime;
      if (duration === 0) {
        continue;
      }

      // If game is tied and dragged into OT, split play into 2
      if (nextPlay && play.elapsedTime < 2880 && nextPlay.elapsedTime > 2880) {
        // Pretend next play lasted until end of regulation
        const firstHill = new Hill(this.world, this, play, { elapsedTime: 2880 });
        group.add(firstHill.mesh);

        // Pretend first play of OT play started at the end of regulation
        play.elapsedTime = 2880.1;
        const secondHill = new Hill(this.world, this, play, nextPlay);
        group.add(secondHill.mesh);

        continue;
      }

      const hill = new Hill(this.world, this, play, nextPlay);
      group.add(hill.mesh);
    }

    // Add mark at final score
    for (let group of this.groups) {
      if (group.children.length === 0) {
        // No children in group
        continue;
      }

      const last = group.children.at(-1);

      const height = 0.4;

      const material = this.world.materials.getBasic(0x201853);
      const cube = new THREE.Mesh(this.world.geometries.getMark(height), material);

      cube.position.x = 0.5 + 0.01;
      cube.position.y = last.userData.heightOffset - height * 0.5;

      last.add(cube);
    }
  }

  createLines() {
    const depth = this.getDepthLines();
    const lineMaterial = this.world.materials.getBasic(0xfbfbff);

    for (let period of this.world.app.data.periods) {
      // Line
      const line = new THREE.Mesh(this.world.geometries.getLine(), lineMaterial);
      line.rotation.x = Math.PI * 0.5;
      line.position.x = this.getWidth(period.seconds) + this.getWidthOffset(2880);
      line.scale.y = depth;
      this.world.scene.instance.add(line);
      this.lines.push(line);
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
  }

  clearShadow() {
    this.world.scene.instance.remove(this.shadow.instance);
  }

  expDecay(a, b, decay = 12, deltaTime = this.world.deltaTime) {
    return b + (a - b) * Math.exp(-decay * deltaTime);
  }

  show(hill) {
    hill.userData.hidden = false;

    hill.scale.y = this.expDecay(hill.scale.y, 1);
    hill.position.y = this.expDecay(hill.position.y, hill.userData.heightOffset);
    hill.userData.opacity = this.expDecay(hill.userData.opacity, 1);

    const { color, opacity } = hill.userData;
    hill.material = this.world.materials.getHill(color, opacity);

    for (let child of hill.children) {
      if (child.isCSS2DObject) {
        child.element.style.opacity = 1;
      }
    }
  }

  hide(hill) {
    hill.userData.hidden = true;

    hill.scale.y = this.expDecay(hill.scale.y, 0);
    hill.position.y = this.expDecay(hill.position.y, 0);
    hill.userData.opacity = this.expDecay(hill.userData.opacity, 0.125);

    const { color, opacity } = hill.userData;
    hill.material = this.world.materials.getHill(color, opacity);

    for (let child of hill.children) {
      if (child.isCSS2DObject) {
        child.element.style.opacity = 0;
      }
    }
  }

  // dim(hill, targetOpacity = 0.125) {
  //   // hill.userData.hidden = false;

  //   // hill.scale.y = this.expDecay(hill.scale.y, 1);
  //   // hill.position.y = this.expDecay(hill.position.y, hill.userData.heightOffset);
  //   hill.userData.opacity = this.expDecay(hill.userData.opacity, targetOpacity);

  //   const { color, opacity } = hill.userData;
  //   hill.material = this.world.materials.getHill(color, opacity);

  //   for (let child of hill.children) {
  //     if (child.isCSS2DObject) {
  //       child.element.style.opacity = opacity === 1 ? 1 : 0;
  //     }
  //   }
  // }

  areFiltered(filters = this.world.app.filters) {
    if (!filters.isAll("opponent")) {
      return true;
    }

    if (!filters.isAll("rounds")) {
      return true;
    }

    if (!filters.isAll("results")) {
      return true;
    }

    if (!filters.isAll("ids")) {
      return true;
    }

    const hasAllQuarters = ["Q1", "Q2", "Q3", "Q4"].every((q) => filters.periods.includes(q));
    if (!hasAllQuarters) {
      return true;
    }

    return false;
  }

  highlight(filters = this.world.app.filters) {
    // Keep track of groups with highlighted hills for calculating filtered stats
    this.highlightedGroups.clear();

    const some = {};

    some.opponent = !filters.isAll("opponent");
    some.rounds = !filters.isAll("rounds");
    some.results = !filters.isAll("results");
    some.periods = !filters.isAll("periods");
    some.ids = !filters.isAll("ids");

    for (let group of this.groups) {
      for (let hill of group.children) {
        let show = true;

        if (this.hideAll) {
          show = false;
        } else if (some.opponent && group.userData.opponent !== filters.opponent) {
          show = false;
        } else if (some.rounds && !filters.rounds.includes(group.userData.type)) {
          show = false;
        } else if (some.results && !filters.results.includes(group.userData.result)) {
          show = false;
        } else if (some.periods && !filters.periods.includes(hill.userData.period)) {
          show = false;
        } else if (some.ids && !filters.ids.includes(group.userData.id)) {
          show = false;
        }

        if (show) {
          this.show(hill);
          this.highlightedGroups.add(group);

          // Don’t check hover when rotating or zooming camera
          if (!this.world.camera.isUserControlling) {
            this.world.raycaster.intersects(hill);
          }
        } else {
          this.hide(hill);
        }
      }
    }

    // Hide tooltip when rotating or zooming camera
    if (this.world.camera.isUserControlling) {
      this.world.tooltips.showDetails(null);
      return;
    }

    const hill = this.world.raycaster.hovered;

    if (hill) {
      // Apply color to hovered hill
      this.world.tooltips.activate(hill);
    }

    // Handle clicks
    if (this.world.pointer.clicked) {
      // If clicked a hill
      if (hill) {
        // Highlight game hill belongs to
        this.world.app.filters.setIDs(hill.parent.userData.id);
      } else {
        // Show all games
        this.world.app.filters.setIDs();

        // If currently in a story, reset to first one
        this.world.app.stories.set(0);
      }

      this.world.pointer.clicked = false;
    }

    // If there are meaningful hills filtered out
    if (this.world.hills.areFiltered()) {
      if (hill) {
        // Show currently-hovered hill
        this.world.tooltips.showDetails(hill);
        return;
      }

      // Hide last hovered tooltip
      this.world.tooltips.showDetails(null);

      // TODO: Calculate dynamic tooltips

      return;
    }

    // Show currently-hovered hill
    this.world.tooltips.showDetails(hill);
  }

  sort(filters = this.world.app.filters) {
    if (filters.sorting === "margin") {
      for (let group of this.groups) {
        const order = group.userData.orderByMargin;
        const z = this.getDepth(order) - this.depthOffset;
        group.position.z = this.expDecay(group.position.z, z);
      }
      return;
    }

    if (filters.sorting === "date") {
      for (let group of this.groups) {
        const total = this.groups.length - 1;
        const order = total - group.userData.orderByDate;
        const z = this.getDepth(order) - this.depthOffset;
        group.position.z = this.expDecay(group.position.z, z);
      }
      return;
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
