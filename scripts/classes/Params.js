export default class Params {
  constructor(app) {
    this.app = app;
  }

  update(formData) {
    // TODO: Make it shorter
    const params = new URLSearchParams(formData);
    history.replaceState(null, "", "?" + params.toString());
  }
}
