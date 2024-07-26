// import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

export default class Label {
  constructor(hill, content, offset = 0) {
    // this.hill = hill;
    this.offset = offset;

    this.element = this.createElement(content);
    this.instance = this.createInstance();

    // this.setup();
  }

  createElement(content) {
    const element = document.createElement("div");
    element.classList.add("label");
    element.innerHTML = content;
    return element;
  }

  createInstance() {
    const instance = new CSS2DObject(this.element);
    instance.position.set(0, this.offset, 0);
    return instance;
  }

  show() {
    this.element.style.opacity = 1;
  }

  hide() {
    this.element.style.opacity = 0;
  }

  // setup() {

  // }
}
