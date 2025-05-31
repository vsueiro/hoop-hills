import Summary from "./Summary.js";

export default class Summaries {
  constructor(world, data) {
    this.world = world;
    this.data = data;
    this.season = {};
    this.list = [];

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
        value: 0,
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
      const { id, biggestLead, biggestTrail, leadChanges } = summary;

      if (biggestLead > this.annotations.biggestLead.value) {
        this.annotations.biggestLead.id = id;
        this.annotations.biggestLead.value = biggestLead;
      }

      if (biggestTrail < this.annotations.biggestTrail.value) {
        this.annotations.biggestTrail.id = id;
        this.annotations.biggestTrail.value = biggestTrail;
      }

      if (leadChanges > this.annotations.mostLeadChanges.value) {
        this.annotations.mostLeadChanges.id = id;
        this.annotations.mostLeadChanges.value = leadChanges;
      }
    }
  }

  // defineBiggestLead() {
  //   // const indexed = this.list
  //   //   .map((summary, index) => ({ ...summary, index }))
  //   //   .sort((a, b) => b.biggestLead - a.biggestLead);
  //   // this.list[indexed[0].index].most.biggestLead = true;
  // }

  // defineBiggestTrail() {
  //   // const indexed = this.list
  //   //   .map((summary, index) => ({ ...summary, index }))
  //   //   .sort((a, b) => a.biggestTrail - b.biggestTrail);
  //   // this.list[indexed[0].index].most.biggestTrail = true;
  // }

  setup() {
    this.createSummaries();
    this.createSeasonSummary();
    this.defineSortingOrder();
    this.defineAnnotations();

    // this.defineBiggestLead();
    // this.defineBiggestTrail();
  }
}
