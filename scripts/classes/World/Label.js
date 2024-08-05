import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

export default class Label {
  constructor(content, x, y, z) {
    this.element = this.createElement(content);
    this.instance = this.createInstance(x, y, z);
  }

  createElement(content) {
    const element = document.createElement("div");

    element.className = "label";
    element.textContent = content;

    return element;
  }

  createInstance(x, y, z) {
    const instance = new CSS2DObject(this.element);
    instance.position.set(x, y, z);
    return instance;
  }
}
