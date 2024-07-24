import Params from "./Params.js";
import Filters from "./Filters.js";
import Data from "./Data.js";
import World from "./World.js";

export default class App {
  constructor() {
    this.params = new Params(this);
    this.filters = new Filters(this, "form");
    this.data = new Data(this);
    this.world = new World(this, ".canvas", ".canvas2D");

    this.setup();
  }

  setup() {
    this.data.load("teams");
    this.data.load("games", () => this.world.build());
  }
}
