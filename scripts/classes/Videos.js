export default class Videos {
  constructor(app, element = ".videos") {
    this.app = app;

    this.dialog = typeof element === "string" ? document.querySelector(element) : element;
    this.iframe = document.querySelector("iframe");
    this.playButton = document.querySelector("button.play-video");

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

    this.playButton.addEventListener("click", () => this.open());

    this.dialog.addEventListener("click", (event) => {
      if (event.target === this.dialog) {
        this.close();
      }
    });
  }

  showButton() {
    this.playButton.hidden = false;
  }

  hideButton() {
    this.playButton.hidden = true;
  }

  open() {
    this.dialog.showModal();
    this.iframe.src = this.src;
  }

  close() {
    this.dialog.close();
  }

  clear() {
    this.src = "about:blank";
    this.iframe.src = this.src;
    this.hideButton();
  }

  update(id) {
    if (!id) {
      this.clear();
      return;
    }

    // if (id === this.currentId) {
    //   return;
    // }

    const video = this.findVideo(id);

    if (!video) {
      this.clear();
      return;
    }

    this.src = `https://www.youtube-nocookie.com/embed/${video}?autoplay=1`;
    this.showButton();
  }
}
