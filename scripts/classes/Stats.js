export default class Stats {
  constructor(app, element = ".stats") {
    this.app = app;

    this.element = typeof element === "string" ? document.querySelector(element) : element;

    this.setup();
  }

  setup() {
    this.element.textContent = "Stats for the current filters will appear here";
  }

  update() {
    if (!this.app.world.hills) return;

    const groups = this.app.world.hills.highlightedGroups;

    if (groups.size === 0) {
      this.element.textContent = "";
      return;
    }

    if (groups.size === 1) {
      const [group] = groups;

      this.element.textContent = `In this 1 game, ${this.app.filters.team} ${group.userData.result} by ${Math.abs(
        group.userData.pointDifference
      )}`;
      return;
    }

    const results = { won: 0, lost: 0 };

    groups.forEach((group) => {
      results[group.userData.result]++;
    });

    this.element.textContent = `In ${groups.size} games, ${this.app.filters.team} won ${results.won} and lost ${results.lost}`;
  }
}
