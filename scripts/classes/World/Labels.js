import { interpolateBlues, interpolateReds } from "d3";
import Label from "./Label.js";

export default class Labels {
  constructor(world) {
    this.world = world;

    this.most = {};
    this.details = null;

    // this.detailedHill = null;

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

  clearDetails() {
    if (this.details === null) {
      return;
    }

    this.details.instance.parent.remove(this.details.instance);
    this.details.element.remove();
    this.details = null;
  }

  createDetails(hill) {
    const content = "???";
    const offset = 0;
    const label = new Label("details", content, offset);
    this.details = label;
    hill.add(label.instance);
  }

  showDetails(hill) {
    if (hill === null) {
      this.clearDetails();

      this.showMost("biggestLead");
      this.showMost("biggestTrail");
      return;
    }

    if (this.details === null) {
      this.createDetails(hill);
    } else if (hill !== this.details.instance.parent) {
      this.clearDetails();
      this.createDetails(hill);
    }

    this.hideMost("biggestLead");
    this.hideMost("biggestTrail");
  }

  clearMost() {
    for (let property in this.most) {
      const label = this.most[property];

      if ("parent" in label.instance) {
        label.instance.parent.remove(label.instance);
      }

      label.element.remove();
      delete this.most[property];
    }
  }

  createMost(property) {
    const hill = this.world.hills.findByMost(property);
    const group = hill.parent;
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
    this.most[property] = label;
    hill.add(label.instance);
  }

  showMost(property) {
    if (!this.most[property]) {
      this.createMost(property);
    }

    this.most[property].show();
  }

  hideMost(property) {
    if (this.most[property]) {
      this.most[property].hide();
    }
  }

  clear() {
    this.clearDetails();
    this.clearMost();
  }

  setup() {
    this.var("leading", interpolateBlues(0.75));
    this.var("trailing", interpolateReds(0.75));
  }

  update() {}
}
