import Summary from "./Summary.js";

export default class Summaries {
  constructor(world, data) {
    this.world = world;
    this.data = data;

    this.list = [];

    this.setup();
  }

  createSummaries() {
    const ids = [];

    for (let play of this.data) {
      const isNewGame = !ids.includes(play.id);

      if (isNewGame) {
        ids.push(play.id);
        const gameIndex = ids.length - 1;
        const summary = new Summary(play, gameIndex);
        this.list.push(summary);
      }

      const summary = this.list.at(-1);
      summary.update(play);
    }
  }

  defineSortingOrder() {
    const indexedSummaries = this.list
      .map((summary, index) => ({ ...summary, index }))
      .sort((a, b) => b.pointDifference - a.pointDifference);

    indexedSummaries.forEach((summary, index) => {
      this.list[summary.index].orderByMargin = index;
    });
  }

  defineMostBiggestLead() {
    const indexed = this.list
      .map((summary, index) => ({ ...summary, index }))
      .sort((a, b) => b.biggestLead - a.biggestLead);

    this.list[indexed[0].index].most.biggestLead = true;
  }

  defineMostBiggestTrail() {
    const indexed = this.list
      .map((summary, index) => ({ ...summary, index }))
      .sort((a, b) => a.biggestTrail - b.biggestTrail);

    this.list[indexed[0].index].most.biggestTrail = true;
  }

  setup() {
    this.createSummaries();
    this.defineSortingOrder();
    this.defineMostBiggestLead();
    this.defineMostBiggestTrail();
  }
}
