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

  areSetsEqual(a, b) {
    return a.size === b.size && [...a].every((value) => b.has(value));
  }

  setup() {
    // Used to only update UI when filtered groups changed
    this.previousGroups = new Set();
  }

  update() {
    if (!this.app.world.hills) return;

    const groups = this.app.world.hills.highlightedGroups;

    if (this.areSetsEqual(groups, this.previousGroups)) return;

    this.previousGroups = new Set(groups);

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

    // Only wins or only losses
    if (!this.app.filters.isAll("results")) {
      this.total.textContent = `${groups.size} ${groups.size === 1 ? "game" : "games"} ${this.app.filters.results}`;
      this.lost.textContent = "";
      this.won.textContent = "";
    }

    // Specific opponent selected
    else if (!this.app.filters.isAll("opponent")) {
      this.total.textContent = `${groups.size} ${groups.size === 1 ? "game" : "games"} vs ${this.app.filters.opponent}`;
      this.lost.textContent = results.lost;
      this.won.textContent = results.won;
    }

    // Every other scenario
    else {
      this.total.textContent = `${groups.size} ${groups.size === 1 ? "game" : "games"}`;
      this.lost.textContent = results.lost;
      this.won.textContent = results.won;
    }

    const percentWon = (results.won / groups.size) * 100;
    const percentLost = 100 - percentWon;
    this.bar.style.setProperty("--percent-won", `calc(${percentWon}% - ${percentWon < 100 ? 0.1 : 0}rem)`);
    this.bar.style.setProperty("--percent-lost", `calc(${percentLost}% - ${percentLost < 100 ? 0.1 : 0}rem)`);

    // if (percentage < 4) percentage = 4;
    // else if (percentage > 96) percentage = 96;
  }
}
