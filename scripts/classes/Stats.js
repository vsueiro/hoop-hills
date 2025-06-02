export default class Stats {
  constructor(app, element = ".stats") {
    this.app = app;

    this.element = typeof element === "string" ? document.querySelector(element) : element;

    this.total = this.element.querySelector(".total");
    this.bar = this.element.querySelector(".bar");
    this.lost = this.element.querySelector(".lost");
    this.won = this.element.querySelector(".won");

    this.setup();
  }

  setup() {
    //
  }

  update() {
    if (!this.app.world.hills) return;

    const groups = this.app.world.hills.highlightedGroups;

    if (groups.size === 0) {
      this.element.hidden = true;
      return;
    }

    this.element.hidden = false;

    // if (groups.size === 1) {
    //   const [group] = groups;

    //   this.element.textContent = `In this 1 game, ${this.app.filters.team} ${group.userData.result} by ${Math.abs(
    //     group.userData.pointDifference
    //   )}`;
    //   return;
    // }

    const results = { won: 0, lost: 0 };

    groups.forEach((group) => {
      results[group.userData.result]++;
    });

    this.total.textContent = `${groups.size} ${groups.size === 1 ? "game" : "games"}`;
    this.lost.textContent = results.lost;
    this.won.textContent = results.won;

    let percentage = (results.lost / groups.size) * 100;

    if (percentage < 4) percentage = 4;
    else if (percentage > 96) percentage = 96;

    this.bar.style.setProperty("--percentage", `${percentage}%`);

    // , ${this.app.filters.team} won ${results.won} and lost ${results.lost}`;
  }
}
