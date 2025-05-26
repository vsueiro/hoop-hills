export default class Stories {
  constructor(app, element = ".stories") {
    this.app = app;

    this.element = typeof element === "string" ? document.querySelector(element) : element;
    this.prevButton = this.element.querySelector(".prev");
    this.nextButton = this.element.querySelector(".next");
    this.contentElement = this.element.querySelector(".content");
    this.chapters = this.element.querySelectorAll(".chapter");
    this.progress = this.element.querySelector(".progress");

    this.current = 0;

    this.setup();
    this.update();
  }

  prev() {
    this.current -= 1;

    if (this.current < 0) {
      this.current = this.chapters.length - 1;
    }

    this.update();
  }

  next() {
    this.current += 1;

    if (this.current > this.chapters.length - 1) {
      this.current = 0;
    }

    this.update();
  }

  setupMarkers() {
    this.chapters.forEach(() => {
      const marker = document.createElement("div");
      marker.classList.add("marker");
      this.progress.append(marker);
    });

    this.markers = this.progress.querySelectorAll(".marker");
  }

  setup() {
    this.setupMarkers();

    this.element.addEventListener("click", () => this.next());
    this.prevButton.addEventListener("click", () => this.prev());
    this.nextButton.addEventListener("click", () => this.next());

    this.update();
  }

  update() {
    this.chapters.forEach((chapter, index) => {
      const isCurrent = index === this.current;
      chapter.hidden = !isCurrent;
      this.markers[index].classList.toggle("current", isCurrent);
    });
  }
}
