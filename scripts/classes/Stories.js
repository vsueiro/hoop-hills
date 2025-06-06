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
  }

  set(index = 0) {
    if ((this.current = index)) return;

    this.current = index;

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

    this.prevButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.prev();
    });
    this.nextButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.next();
    });
  }

  // Separate update allows filter to collapse on general chapter, when called from Tooltips
  updateAnnotations() {
    const { annotation } = this.chapters[this.current].dataset;

    switch (annotation) {
      case "general":
      case undefined:
        this.app.world.tooltips.showAnnotation(["biggestLead", "biggestTrail"]);
        break;

      case "biggestComeback":
        this.app.world.tooltips.showAnnotation("biggestComeback");
        break;

      case "mostLeadChanges":
        this.app.world.tooltips.showAnnotation("mostLeadChanges");
        break;

      case "finalScores":
        this.app.world.tooltips.showAnnotation(["biggestLead", "biggestTrail"]);
        break;

      default:
        this.app.world.tooltips.showAnnotation();
        break;
    }
  }

  update() {
    this.app.world.idle.reset();

    // Toggle visibility of chapters
    this.chapters.forEach((chapter, index) => {
      const isCurrent = index === this.current;
      chapter.hidden = !isCurrent;
      this.markers[index].classList.toggle("current", isCurrent);
    });

    const { annotation } = this.chapters[this.current].dataset;
    const { annotations } = this.app.world.summaries;

    this.updateAnnotations();

    // Filter and highlight hills based on current chapter
    switch (annotation) {
      case "general":
      case undefined:
        this.app.filters.setPeriods(["Q1", "Q2", "Q3", "Q4"]);
        this.app.filters.setResults();
        this.app.filters.setOpponent();
        this.app.filters.setView("corner");
        this.app.filters.setIDs();
        this.app.filters.collapse(false);

        break;

      case "biggestComeback":
        this.app.filters.setPeriods();
        this.app.filters.setResults();
        this.app.filters.setOpponent();
        this.app.filters.setView("corner");
        this.app.filters.setIDs(annotations.biggestComeback.id);
        this.app.filters.collapse(true);

        break;

      case "mostLeadChanges":
        this.app.filters.setPeriods();
        this.app.filters.setResults();
        this.app.filters.setOpponent();
        this.app.filters.setView("corner");
        this.app.filters.setIDs(annotations.mostLeadChanges.id);
        this.app.filters.collapse(true);

        break;

      case "finalScores":
        this.app.filters.setPeriods();
        this.app.filters.setResults();
        this.app.filters.setOpponent();
        this.app.filters.setView("bars");
        this.app.filters.setIDs();
        this.app.filters.collapse(true);

        break;
    }
  }
}
