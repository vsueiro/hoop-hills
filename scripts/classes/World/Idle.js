export default class Idle {
  constructor(world) {
    this.world = world;
    this.state = false;
    this.limit = 4; // In seconds
    this.timer = 0;

    this.setup();
  }

  reset() {
    this.timer = 0;
  }

  setup() {}

  update() {
    this.timer += this.world.deltaTime;
    this.state = this.timer > this.limit;
  }
}
