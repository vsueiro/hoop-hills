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

    const results = { won: 0, lost: 0 };

    groups.forEach((group) => {
      results[group.userData.result]++;
    });

    // Only 1 game selected (clicked)
    if (groups.size === 1) {
      const result = results.won > results.lost ? "won" : "lost";

      const [group] = groups;
      const { date, opponent, pointDifference } = group.userData;

      const pts = new Intl.NumberFormat("en-US", {
        signDisplay: "always",
      }).format(pointDifference);

      const opponentInitials = this.app.world.summaries.getInitials(opponent);
      // this.total.textContent = `${date.split(",")[0]} game vs ${opponent}`;
      this.total.textContent = `game vs ${opponentInitials}`;
      this.lost.textContent = result === "lost" ? `${pts} pts` : "";
      this.won.textContent = result === "won" ? `${pts} pts` : "";
    }

    // Only wins or only losses
    else if (!this.app.filters.isAll("results")) {
      const result = results.won > results.lost ? "won" : "lost";

      this.total.textContent = "";
      this.lost.textContent = result === "lost" ? results.lost : "";
      this.won.textContent = result === "won" ? results.won : "";
    }

    // Specific opponent selected
    else if (!this.app.filters.isAll("opponent")) {
      const opponent = this.app.filters.opponent;
      const opponentInitials = this.app.world.summaries.getInitials(opponent);
      this.total.textContent = `${groups.size} ${groups.size === 1 ? "game" : "games"} vs ${opponentInitials}`;
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
