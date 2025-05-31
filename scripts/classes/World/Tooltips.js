import Tooltip from "./Tooltip.js";

export default class Tooltips {
  constructor(world) {
    this.world = world;

    this.annotations = {};
    this.details = null;

    // this.setup();
  }

  getTeam(id) {
    const teams = this.world.app.data.teams;
    return teams.find((team) => team.id === id);
  }

  getContent(hill) {
    const isLastPlay = hill.userData.isLastPlay;
    const score = hill.userData.teamScore;
    const diff = hill.userData.pointDifference;
    const gap = Math.abs(diff);

    const teamId = this.world.app.filters.team;
    const team = this.getTeam(teamId);

    const opponentId = hill.parent.userData.opponent;
    const opponent = this.getTeam(opponentId);

    const situation = diff === 0 ? "tied" : diff > 0 ? "leading" : "trailing";
    const label = isLastPlay ? (situation === "leading" ? "won" : "lost") : false;

    const content = `
      <div class="content">
        ${team.initials}
        <b class="${situation}">
          ${situation === "tied" ? "is tied" : label || situation}
        </b>
        <br>
        ${situation === "tied" ? `at ${score}` : `by ${gap}`} 
        vs
        ${opponent.initials}
      </div>
    `;

    return content;
  }

  getOffset(hill) {
    return hill.userData.heightOffset;
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
    hill.material = this.world.materials.getBasic(0x201853);
  }

  deactivate(hill) {
    const { color } = hill.userData;
    hill.material = this.world.materials.getHill(color, 1);
  }

  createDetails(hill) {
    if (!hill) return;

    this.activate(hill);

    const content = this.getContent(hill);
    const offset = this.getOffset(hill);
    const tooltip = new Tooltip(hill, content, offset);
    this.details = tooltip;
    hill.add(tooltip.instance);
  }

  showDetails(hill) {
    if (hill === null) {
      this.clearDetails();

      this.world.app.stories.updateAnnotations();
      return;
    }

    if (this.details === null) {
      this.createDetails(hill);
    } else if (hill !== this.details.instance.parent) {
      this.clearDetails();

      this.createDetails(hill);
    }

    this.hideAnnotations();
  }

  clearAnnotations() {
    for (let property in this.annotations) {
      const tooltip = this.annotations[property];

      if ("parent" in tooltip.instance) {
        tooltip.instance.parent.remove(tooltip.instance);
      }

      tooltip.element.remove();
      delete this.annotations[property];
    }
  }

  createAnnotations(property) {
    if (!this.world.hills) return;

    const { hill } = this.world.hills.findByAnnotation(property);

    if (!hill) return;

    const content = this.getContent(hill);
    const offset = this.getOffset(hill);
    const tooltip = new Tooltip(hill, content, offset);
    this.annotations[property] = tooltip;
    hill.add(tooltip.instance);
  }

  showAnnotation(properties) {
    this.hideAnnotations();

    if (!properties) return;

    // Single property
    if (typeof properties === "string") {
      const property = properties;

      if (!this.annotations[property]) {
        this.createAnnotations(property);
      }
      this.annotations[property]?.show();
      return;
    }

    // List of properties
    if (Array.isArray(properties)) {
      for (let property of properties) {
        if (!this.annotations[property]) {
          this.createAnnotations(property);
        }
        this.annotations[property]?.show();
      }
    }
  }

  hideAnnotation(property) {
    if (this.annotations[property]) {
      this.annotations[property]?.hide();
    }
  }

  hideAnnotations() {
    for (let property in this.annotations) {
      this.annotations[property]?.hide();
    }
  }

  clear() {
    this.clearDetails();
    this.clearAnnotations();
  }

  // setup() {}

  // update() {}
}
