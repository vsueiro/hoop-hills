export default class Videos {
  constructor(app, element = ".videos") {
    this.app = app;

    this.currentId = null;

    this.element = typeof element === "string" ? document.querySelector(element) : element;
    this.iframe = this.element.querySelector("iframe");
    this.setup();
  }

  // Binary Search
  findVideo(id, arr = this.app.data.highlights) {
    let start = 0;
    let end = arr.length - 1;

    while (start <= end) {
      const mid = Math.floor((start + end) / 2);

      if (arr[mid].id === id) return arr[mid].video;
      if (arr[mid].id < id) start = mid + 1;
      else end = mid - 1;
    }

    return null;
  }

  setup() {
    this.app.data.load("highlights", () => {
      this.app.videos.update();
    });
  }

  clear() {
    this.iframe.src = "about:blank";
    this.currentId = null;
  }

  update(id) {
    if (!id) {
      this.clear();
      return;
    }

    if (id === this.currentId) {
      return;
    }

    const video = this.findVideo(id);

    if (!video) {
      this.clear();
      return;
    }

    this.iframe.src = `https://www.youtube-nocookie.com/embed/${video}?controls=0&autoplay=1`;

    this.currentId = id;
  }
}
