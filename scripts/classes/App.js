import Filters from "./Filters.js";
import Data from "./Data.js";
import World from "./World.js";

export default class App {
  constructor() {
    this.filters = new Filters(this, "form");
    this.data = new Data(this);
    this.world = new World(this, "canvas");
  }
  update() {
    console.log("Just updated games data");
  }
}
