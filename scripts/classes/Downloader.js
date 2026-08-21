export default class Downloader {
  constructor(app) {
    this.app = app;

    this.setup()
  }

  get mode() {
    // Return boolean if #download hash exist in current URL
    return document.location.hash === "#download";
  }

  download(blob, filename = "download.png") {
    const anchor = document.createElement("a");
    anchor.download = filename;
    anchor.href = URL.createObjectURL(blob);
    anchor.click();
    // Remove to save memory
    URL.revokeObjectURL(anchor.href);
  }

  capture(canvas) {
    // Adapted from https://www.digitalocean.com/community/tutorials/js-canvas-toblob
    canvas.toBlob(
        blob => {
            this.download(blob);
        },
        'image/png',
        1,
    );
  }

  setup() {
    // If no #download is found on URL, abot
    if (!this.mode) return;

    // Otherwise, enable custom controls

    // `u` key to hide/show UI
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "u") {
        document.body.classList.toggle("minimal-ui");
      }
    });

    // `d` to Download <canvas> content as transparent PNG
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "d") {
        this.capture(this.app.world.canvas);
      }
    });

  }
}
