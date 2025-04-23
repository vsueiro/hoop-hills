export default class DeltaTime {
  constructor(lastTime) {
    this.lastTime = lastTime === undefined ? 0 : lastTime;
    this.fps = document.querySelector(".fps");
    this.value = 0;
  }

  valueOf() {
    return this.value;
  }

  update(currentTime) {
    this.value = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (this.fps) this.fps.textContent = "◼️".repeat(Math.round(0.1 / this.value));
  }
}
