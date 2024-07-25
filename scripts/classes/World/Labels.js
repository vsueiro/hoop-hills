import { interpolateBlues, interpolateReds } from "d3";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

export default class Labels {
  constructor(world) {
    this.world = world;
    this.list = [];

    this.root = document.querySelector(":root");
    this.setup();
  }

  var(property, value) {
    this.root.style.setProperty(`--${property}`, value);
  }

  add(property) {
    const { hill, group } = this.world.hills.findByMost(property);

    let content = ``;

    switch (property) {
      case "biggestLead":
        content = `
          ${this.world.app.filters.team} 
          <span class="leading">leading</span><br>
          by ${Math.abs(hill.userData.pointDifference)}
          vs ${group.userData.opponent}
        `;
        break;

      case "biggestTrail":
        content = `
          ${this.world.app.filters.team}
          <span class="trailing">trailing</span><br>
          by ${Math.abs(hill.userData.pointDifference)}
          vs ${group.userData.opponent}
        `;
        break;
    }

    const div = document.createElement("div");
    div.dataset.label = property;
    div.innerHTML = `<div class="content">${content}</div>`;

    const label = new CSS2DObject(div);
    label.position.set(0, hill.userData.heightOffset, 0);

    this.list.push(label);
    hill.add(label);
  }

  clear() {
    for (let i = this.list.length - 1; i >= 0; i--) {
      this.list[i].element.remove();
      this.list.splice(i, 1);
    }
  }

  setup() {
    this.var("leading", interpolateBlues(0.75));
    this.var("trailing", interpolateReds(0.75));
  }
}
