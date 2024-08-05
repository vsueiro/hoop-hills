import Label from "./Label.js";

export default class Labels {
  constructor(world) {
    this.world = world;

    this.groups = {
      periodsFront: [],
      periodsBack: [],
    };
  }

  get isCleared() {
    return Object.values(this.groups).every((list) => list.length === 0);
  }

  createPeriodLabels() {
    const { periods } = this.world.app.data;
    const { hills } = this.world;
    const offsetX = hills.getWidthOffset(2880 - 720);
    const offsetZ = hills.depth * 2;
    const offsetOT = hills.getWidthOffset(120);

    for (let period of periods) {
      const content = period.label;
      const x = hills.getWidth(period.seconds) + offsetX + (content === "OT" ? offsetOT : 0);
      const y = 0;
      const z = hills.depthOffset + offsetZ;

      const labelFront = new Label(content, x, y, z);
      const labelBack = new Label(content, x, y, -z);

      this.world.scene.instance.add(labelFront.instance);
      this.groups.periodsFront.push(labelFront);

      this.world.scene.instance.add(labelBack.instance);
      this.groups.periodsFront.push(labelBack);
    }
  }

  create() {
    this.createPeriodLabels();
  }

  clear() {
    for (let group in this.groups) {
      const list = this.groups[group];

      for (let i = list.length - 1; i >= 0; i--) {
        const label = list[i];
        this.world.scene.instance.remove(label.instance);
        label.element.remove();
        list.splice(i, 1);
      }
    }
  }

  update() {
    if (this.world.hills === undefined) {
      return;
    }

    if (this.isCleared) {
      this.create();
    }
  }
}
