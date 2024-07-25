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

  // clearDetails() {
  //   const property = "details";

  //   if (property in this.names) {
  //     const label = this.names[property];
  //     const hill = label.instance.parent;

  //     console.log(label);
  //     // console.log(label.instance);
  //     // console.log(label.instance.parent);

  //     if (hill) {
  //       const { color } = hill.userData;

  //       hill.material.color.set(color);

  //       // TO FIX
  //       hill.remove(label.instance);
  //       label.instance.element.remove();
  //     }
  //   }
  // }

  // createDetails(hill) {
  //   const property = "details";
  //   const content = "AAA";
  //   const label = new Label(property, content, hill.userData.heightOffset);
  //   this.names[property] = label;
  //   hill.add(label.instance);
  // }

  // showDetails(hill) {
  //   // if (this.detailedHill && hill !== this.detailedHill) {
  //   this.clearDetails();
  //   // }

  //   if (hill !== null) {
  //     this.createDetails(hill);
  //     hill.material.color.set(0x000000);
  //     // this.detailedHill = hill;
  //   }
  // }

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
    this.names[property] = label;
    hill.add(label.instance);
  }

  showMost(property) {
    if (!this.names[property]) {
      this.createMost(property);
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
