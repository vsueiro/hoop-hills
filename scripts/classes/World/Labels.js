export default class Labels {
  constructor(world) {
    this.world = world;
  }

  clear() {}

  update() {
    if (this.world.hills === undefined) {
      return;
    }

    // console.log(this.world.hills);
  }
}
