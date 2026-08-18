import Filters from "./Filters.js";
import Data from "./Data.js";
import World from "./World.js";
import Stories from "./Stories.js";
import Stats from "./Stats.js";
import Videos from "./Videos.js";

export default class App {
  constructor() {
    this.filters = new Filters(this, "form");
    this.data = new Data(this);
    this.world = new World(this, ".canvas", ".canvas2D");
    this.stories = new Stories(this, ".stories");
    this.stats = new Stats(this, ".stats");
    this.videos = new Videos(this, ".videos");

    this.setup();
  }

  setup() {

    // Load teams first to populate filters
    this.data.load("teams", () => {

      // Fill in team options
      this.filters.populateTeams();

      // Pick a random team
      this.filters.setRandomTeam();

      // Then load remaining data
      this.data.load("periods");
      this.data.load("games");

      // Initialize
      this.data.once("ready", () => {
        this.world.build();
        this.filters.disableUnavailables();
        this.stories.update();
      });
    });

    
  }
}
