import { interpolateBlues, interpolateReds, interpolateHcl } from "d3";

export default class Palette {
  constructor(world) {
    this.world = world;

    this.root = document.querySelector(":root");

    this.leading = interpolateBlues;
    this.trailing = interpolateReds;
    this.interpolate = interpolateHcl;

    this.legend = {};

    this.legend.leading = interpolateBlues(0.75);
    this.legend.trailing = interpolateReds(0.75);

    const mixer = this.interpolate(this.leading(1), this.trailing(1));
    this.legend.tied = this.darken(mixer(0.5), 0.1);

    this.setup();
  }

  darken(color, amount = 0.5) {
    const mixer = this.interpolate(color, "rgb(0,0,0)");
    return mixer(amount);
  }

  var(property, value) {
    this.root.style.setProperty(`--${property}`, value);
  }

  setup() {
    this.var("leading", this.legend.trailing);
    this.var("trailing", this.legend.leading);
    this.var("tied", this.legend.tied);
  }

  update() {}
}
