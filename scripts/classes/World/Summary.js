export default class Summary {
  constructor(play, gameIndex) {
    this.id = play.id;
    this.opponent = play.opponent;
    this.venue = this.id.slice(-3);
    this.home = this.opponent !== this.venue;
    this.type = play.type;

    this.leadChanges = 0;
    this.timesTied = 0;
    this.biggestLead = 0;
    this.biggestTrail = 0;
    this.teamScore = 0;
    this.opponentScore = 0;
    this.pointDifference = 0;

    // Has points scored after (or very near) end of game
    this.buzzerBeater = false;

    this.result = "";

    this.orderByDate = gameIndex;
    this.orderByMargin = 0;

    // Used for highlighting
    // this.most = {};
    // this.most.leadChanges = false; // TODO
    // this.most.timesTied = false; // TODO
    // this.most.biggestLead = false;
    // this.most.biggestTrail = false;

    this.date = this.formatDate(this.id);

    this.setup();
  }

  formatDate(id) {
    if (!this.formatter) {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      };
      this.formatter = new Intl.DateTimeFormat("en-US", options);
    }

    const year = id.slice(0, 4);
    const month = id.slice(4, 6) - 1;
    const day = id.slice(6, 8);
    const date = new Date(Date.UTC(year, month, day));

    return this.formatter.format(date);
  }

  setup() {}

  update(play, isLastPlay) {
    const diff = play.pointDifference;

    if (diff > this.biggestLead) {
      this.biggestLead = diff;
    } else if (diff < this.biggestTrail) {
      this.biggestTrail = diff;
    }

    switch (play.event) {
      case "LC":
        this.leadChanges += 1;
        break;
      case "T":
        this.timesTied += 1;
        break;
      case "F":
        this.teamScore = play.teamScore;
        this.opponentScore = play.opponentScore;
        this.pointDifference = play.pointDifference;
        this.result = play.teamScore > play.opponentScore ? "won" : "lost";
        break;
    }

    this.buzzerBeater = isLastPlay && play.event === "F";
  }
}
