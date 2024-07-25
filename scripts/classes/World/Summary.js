export default class Summary {
  constructor(play, gameIndex) {
    this.id = play.id;
    this.opponent = play.opponent;
    this.type = play.type;

    this.leadChanges = 0;
    this.timesTied = 0;
    this.biggestLead = 0;
    this.biggestTrail = 0;
    this.teamScore = 0;
    this.opponentScore = 0;
    this.pointDifference = 0;

    this.result = "";

    this.orderByDate = gameIndex;
    this.orderByMargin = 0;

    // Used for highlighting
    this.most = {};
    this.most.leadChanges = false; // TODO
    this.most.timesTied = false; // TODO
    this.most.biggestLead = false;
    this.most.biggestTrail = false;

    this.setup();
  }
  setup() {}

  update(play) {
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
  }
}
