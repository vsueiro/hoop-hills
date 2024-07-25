import { interpolateBlues, interpolateReds } from "d3";
import Label from "./Label.js";

export default class Labels {
  constructor(world) {
    this.world = world;
    this.names = {};

    this.detailedHill = null;

    this.root = document.querySelector(":root");
    this.setup();
  }

  getTeam(id) {
    const teams = this.world.app.data.teams;
    return teams.find((team) => team.id === id);
  }

  var(property, value) {
    this.root.style.setProperty(`--${property}`, value);
  }

  showDetails(hill) {
    if (this.detailedHill && hill !== this.detailedHill) {
      // Reset
      const { color } = this.detailedHill.userData;
      this.detailedHill.material.color.set(color);
    }

    if (hill !== null) {
      hill.material.color.set(0x000000);
    }

    this.detailedHill = hill;
  }

  create(property) {
    const { hill, group } = this.world.hills.findByMost(property);

    const id = this.world.app.filters.team;
    const team = this.getTeam(id);

    let content = ``;

    switch (property) {
      case "biggestLead":
        content = `
          ${team.initials}
          <span class="leading">leading</span><br>
          by ${Math.abs(hill.userData.pointDifference)}
          vs ${group.userData.opponent}
        `;
        break;

      case "biggestTrail":
        content = `
          ${team.initials}
          <span class="trailing">trailing</span><br>
          by ${Math.abs(hill.userData.pointDifference)}
          vs ${group.userData.opponent}
        `;
        break;
    }

    const label = new Label(property, content, hill.userData.heightOffset);
    this.names[property] = label;
    hill.add(label.instance);
  }

  show(property) {
    if (!this.names[property]) {
      this.create(property);
    }

    // TODO: Make sure this.names[property].instance is shown
  }

  clear() {
    for (let name in this.names) {
      this.names[name].element.remove();
      delete this.names[name];
    }
  }

  setup() {
    this.var("leading", interpolateBlues(0.75));
    this.var("trailing", interpolateReds(0.75));
  }

  update() {}
}
