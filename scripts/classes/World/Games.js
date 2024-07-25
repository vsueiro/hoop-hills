export default class Games {
  constructor(world, data) {
    this.world = world;
    this.data = data;

    this.ids = [];
    this.summaries = [];

    this.setup();
  }

  createSummary() {
    this.data.forEach((play, i) => {
      if (!this.ids.includes(play.id)) {
        this.ids.push(play.id);

        const summary = {
          id: play.id,
          opponent: play.opponent,
          type: play.type,

          leadChanges: 0,
          timesTied: 0,
          biggestLead: 0,
          biggestTrail: 0,
          teamScore: 0,
          opponentScore: 0,
          pointDifference: 0,

          // Used for highlighting
          most: {
            leadChanges: false, // TODO
            timesTied: false, // TODO
            biggestLead: false,
            biggestTrail: false,
          },

          result: "",

          orderByDate: this.ids.length - 1,
          orderByMargin: 0,
        };

        this.summaries.push(summary);
      }

      const summary = this.summaries.at(-1);

      if (play.pointDifference > summary.biggestLead) {
        summary.biggestLead = play.pointDifference;
      } else if (play.pointDifference < summary.biggestTrail) {
        summary.biggestTrail = play.pointDifference;
      }

      if (play.event === "LC") {
        summary.leadChanges += 1;
      } else if (play.event === "T") {
        summary.timesTied += 1;
      } else if (play.event === "F") {
        summary.teamScore = play.teamScore;
        summary.opponentScore = play.opponentScore;
        summary.pointDifference = play.pointDifference;
        summary.result = play.teamScore > play.opponentScore ? "won" : "lost";
      }
    });

    // Calculated order sorted by margin
    const indexedSummaries = this.summaries
      .map((summary, index) => ({ ...summary, index }))
      .sort((a, b) => b.pointDifference - a.pointDifference);

    indexedSummaries.forEach((summary, index) => {
      // Define sorting order
      this.summaries[summary.index].orderByMargin = index;

      // Set biggest lead and trail of season
      if (index === 0) {
        this.summaries[summary.index].most.biggestLead = true;
      } else if (index === indexedSummaries.length - 1) {
        this.summaries[summary.index].most.biggestTrail = true;
      }
    });
  }

  setup() {
    this.createSummary();
  }

  update() {}
}
