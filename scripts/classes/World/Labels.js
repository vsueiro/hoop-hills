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

  getContent(hill) {
    const score = hill.userData.teamScore;
    const diff = hill.userData.pointDifference;
    const gap = Math.abs(diff);

    const teamId = this.world.app.filters.team;
    const team = this.getTeam(teamId);

    const opponentId = hill.parent.userData.opponent;
    const opponent = this.getTeam(opponentId);

    let situation = "";

    if (diff > 0) {
      situation = "leading";
    } else if (diff < 0) {
      situation = "trailing";
    } else {
      situation = "tied";
    }

    const content = `
      ${team.initials}
      <b class="${situation}">
        ${situation === "tied" ? "is tied" : situation}
      </b>
      <br>
      ${situation === "tied" ? `at ${score}` : `by ${gap}`} 
      vs
      ${opponent.initials}
    `;

    return content;
  }

  getOffset(hill) {
    return hill.userData.heightOffset;
  }

  var(property, value) {
    this.root.style.setProperty(`--${property}`, value);
  }

  clearDetails() {
    if (this.details === null) {
      return;
    }

    const hill = this.details.instance.parent;

    this.deactivate(hill);

    hill.remove(this.details.instance);
    this.details.element.remove();
    this.details = null;
  }

  activate(hill) {
    hill.material.color.set(0x000000);
  }

  deactivate(hill) {
    const { color } = hill.userData;
    hill.material.color.set(color);
  }

  createDetails(hill) {
    this.activate(hill);

    const content = this.getContent(hill);
    const offset = this.getOffset(hill);
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
    const content = this.getContent(hill);
    const offset = this.getOffset(hill);
    const label = new Label(property, content, offset);
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
    this.var("leading", interpolateBlues(0.8));
    this.var("trailing", interpolateReds(0.8));
  }

  update() {}
}
