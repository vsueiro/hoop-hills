import Filters from "./Filters.js";
import Data from "./Data.js";
import World from "./World.js";
import Stories from "./Stories.js";
import Stats from "./Stats.js";

export default class App {
  constructor() {
    this.filters = new Filters(this, "form");
    this.data = new Data(this);
    this.world = new World(this, ".canvas", ".canvas2D");
    this.stories = new Stories(this, ".stories");
    this.stats = new Stats(this, ".stats");

    this.setup();
  }

  setup() {
    this.data.load("periods");
    this.data.load("teams");
    this.data.load("games");

    this.data.once("ready", () => {
      this.world.build();
      this.filters.disableUnavailables();
      this.stories.update();
    });
  }
}
