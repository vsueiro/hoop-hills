export default class Filters {
  constructor(app, form = "form") {
    this.app = app;

    this.form = typeof form === "string" ? document.querySelector(form) : form;

    this.teamSelector = this.form.querySelector('[name="team"]');
    this.opponentSelector = this.form.querySelector('[name="opponent"]');

    this.setup();
    this.update();
  }

  setView(value) {
    const radios = this.form.querySelectorAll('[name="view"]');

    for (let radio of radios) {
      if (radio.value === value) {
        radio.checked = true;
        this.view = value;
        continue;
      }

      radio.checked = false;
    }
  }

  isAll(field) {
    const values = {
      opponent: "all",
      games: ["RS", "PI", "PO"],
      results: ["won", "lost"],
      periods: ["Q1", "Q2", "Q3", "Q4", "OTs"],
    };

    if (typeof this[field] === "string") {
      return this[field] === values[field];
    }

    const isArrayEqual =
      this[field].length === values[field].length &&
      this[field].every((value, index) => value === values[field][index]);

    return isArrayEqual;
  }

  preventSameTeamSelection() {
    for (let option of this.opponentSelector.options) {
      option.hidden = option.value === this.teamSelector.value;
    }

    if (this.opponentSelector.value === this.teamSelector.value) {
      this.opponentSelector.value = "all";
    }
  }

  setup() {
    // Handle form submission
    this.form.addEventListener("input", (event) => {
      this.update();

      const name = event.target.name;

      switch (name) {
        case "view":
          // Allow camera animation on view selection
          this.app.world.camera.isUserRotating = false;
          this.app.world.camera.isUserZooming = false;
          break;

        case "team":
          this.app.world.hills.hideAll = true;

          // Reload data when team changes
          this.app.data.load("games", () => this.app.world.build());
          // Prevent opponent from being the currently selected team
          this.preventSameTeamSelection();
          break;

        case "season":
          this.app.world.hills.hideAll = true;

          // Reload data when season changes
          this.app.data.load("games", () => this.app.world.build());
          break;
      }
    });
  }

  update() {
    const formData = new FormData(this.form);

    this.team = formData.get("team");
    this.opponent = formData.get("opponent");
    this.season = formData.get("season");
    this.sorting = formData.get("sorting");
    this.view = formData.get("view");

    this.games = formData.getAll("games");
    this.results = formData.getAll("results");
    this.periods = formData.getAll("periods");

    this.app.params.update(formData);
  }
}
