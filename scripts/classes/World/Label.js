import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

export default class Label {
  constructor(property, content, offset = 0) {
    this.element = document.createElement("div");
    this.element.dataset.label = property;
    this.element.innerHTML = `<div class="content">${content}</div>`;

    this.instance = new CSS2DObject(this.element);
    this.instance.position.set(0, offset, 0);
  }
}
