import { interpolateBlues, interpolateReds } from "d3";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

export default class Labels {
  constructor(world) {
    this.world = world;

    this.root = document.querySelector(":root");
    this.setup();
  }

  var(property, value) {
    this.root.style.setProperty(`--${property}`, value);
  }

  addBiggestLead() {
    const groups = this.world.hills.groups;
    const first = 0;

    for (let group of groups) {
      const order = group.userData.orderByMargin;

      if (order !== first) {
        continue;
      }

      for (let hill of group.children) {
        if (hill.userData.pointDifference !== group.userData.biggestLead) {
          continue;
        }

        const div = document.createElement("div");
        div.classList.add("label");
        div.innerHTML = `
          Leading<br>
          by ${Math.abs(hill.userData.pointDifference)}<br>
          vs ${group.userData.opponent}`;
        const label = new CSS2DObject(div);
        label.position.set(0, hill.userData.heightOffset, 0);
        hill.add(label);

        break;
      }
    }
  }

  addBiggestTrail() {
    const groups = this.world.hills.groups;
    const last = groups.length - 1;

    for (let group of groups) {
      const order = group.userData.orderByMargin;

      if (order !== last) {
        continue;
      }

      for (let hill of group.children) {
        if (hill.userData.pointDifference !== group.userData.biggestTrail) {
          continue;
        }
        const div = document.createElement("div");
        div.classList.add("label");
        div.innerHTML = `
          Trailing<br>
          by ${Math.abs(hill.userData.pointDifference)}<br>
          vs ${group.userData.opponent}`;
        const label = new CSS2DObject(div);
        label.position.set(0, hill.userData.heightOffset, 0);
        hill.add(label);

        break;
      }
    }
  }

  setup() {
    this.var("leading", interpolateBlues(0.75));
    this.var("trailing", interpolateReds(0.75));
  }
}
