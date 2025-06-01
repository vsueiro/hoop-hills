import Summary from "./Summary.js";

export default class Summaries {
  constructor(world, data) {
    this.world = world;
    this.data = data;
    this.season = {};
    this.list = [];
    this.blanks = document.querySelectorAll("[data-fill]");

    this.annotations = {
      // Whole games
      mostLeadChanges: {
        id: null,
        value: 0,
      },
      longestWinningStreak: {
        id: null,
        value: 0,
      },
      longestLosingStreak: {
        id: null,
        value: 0,
      },

      // Moment (hill) in a game
      biggestLead: {
        id: null,
        value: 0,
        hill: null,
      },
      biggestTrail: {
        id: null,
        value: 0,
        hill: null,
      },
      biggestComeback: {
        id: null,
        value: 0, // biggest trail, but won at the end
        hill: null,
      },
      longestRun: {
        id: null,
        value: 0,
        hill: null,
      },
    };

    this.setup();
  }

  createSummaries() {
    const ids = [];

    this.data.forEach((play, index) => {
      const isNewGame = !ids.includes(play.id);
      const nextPlay = this.data[index + 1];
      const isLastPlay = !nextPlay || play.id !== nextPlay.id;

      if (isNewGame) {
        ids.push(play.id);
        const gameIndex = ids.length - 1;
        const summary = new Summary(play, gameIndex);
        this.list.push(summary);
      }

      const summary = this.list.at(-1);
      summary.update(play, isLastPlay);
    });
  }

  createSeasonSummary() {
    this.season.games = this.list.length;

    this.list.forEach((summary) => {
      const { result } = summary;

      if (!this.season[result]) {
        this.season[result] = 0;
      }

      this.season[result]++;
    });
  }

  getSummary(id) {
    if (!id) return;

    return this.list.find((summary) => summary.id === id);
  }

  defineSortingOrder() {
    const indexedSummaries = this.list
      .map((summary, index) => ({ ...summary, index }))
      .sort((a, b) => b.pointDifference - a.pointDifference);

    indexedSummaries.forEach((summary, index) => {
      this.list[summary.index].orderByMargin = index;
    });
  }

  defineAnnotations() {
    for (let summary of this.list) {
      const { id, leadChanges, biggestLead, biggestTrail, result } = summary;

      if (leadChanges > this.annotations.mostLeadChanges.value) {
        this.annotations.mostLeadChanges.id = id;
        this.annotations.mostLeadChanges.value = leadChanges;
      }

      if (biggestLead > this.annotations.biggestLead.value) {
        this.annotations.biggestLead.id = id;
        this.annotations.biggestLead.value = biggestLead;
      }

      if (biggestTrail < this.annotations.biggestTrail.value) {
        this.annotations.biggestTrail.id = id;
        this.annotations.biggestTrail.value = biggestTrail;
      }

      if (biggestTrail < this.annotations.biggestComeback.value && result === "won") {
        this.annotations.biggestComeback.id = id;
        this.annotations.biggestComeback.value = biggestTrail;
      }
    }
  }

  fillBlanks() {
    for (let blank of this.blanks) {
      const { fill } = blank.dataset;

      switch (fill) {
        case "team":
          blank.textContent = this.world.app.filters.team;
          break;
        case "opponent":
          blank.textContent = this.world.app.filters.opponent;
          break;
        case "comeback-deficit":
          blank.textContent = Math.abs(this.annotations.biggestComeback.value);
          break;
        case "lead-changes":
          blank.textContent = this.annotations.mostLeadChanges.value;
          break;
        case "lead-changes-opponent":
          blank.textContent = this.getSummary(this.annotations.mostLeadChanges.id).opponent;
          break;
        case "lead-changes-result":
          blank.textContent = this.getSummary(this.annotations.mostLeadChanges.id).result;
          break;
        case "lead-changes-point-difference":
          blank.textContent = Math.abs(this.getSummary(this.annotations.mostLeadChanges.id).pointDifference);
          break;
      }
    }
  }

  setup() {
    this.createSummaries();
    this.createSeasonSummary();
    this.defineSortingOrder();
    this.defineAnnotations();
    this.fillBlanks();
  }
}
