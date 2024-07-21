export default class Filters {
  constructor(app, form = "form") {
    this.app = app;

    this.form = typeof form === "string" ? document.querySelector(form) : form;

    this.teamSelector = this.form.querySelector('[name="team"]');
    this.opponentSelector = this.form.querySelector('[name="opponent"]');

    this.allValues = {
      opponent: "all",
      games: ["RS", "PI", "PO"],
      results: ["won", "lost"],
      periods: ["Q1", "Q2", "Q3", "Q4", "OTs"],
    };

    this.setup();
    this.update();
  }

  isAll(field) {
    if (typeof this[field] === "string") {
      return this[field] === this.allValues[field];
    }

    const isArrayEqual =
      this[field].length === this.allValues[field].length &&
      this[field].every((value, index) => value === this.allValues[field][index]);

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
          this.app.world.isOrbitControlling = false;
          break;
        case "team":
          // Reload data when team changes
          this.app.data.load("games", this.app.update);

          // Prevent opponent from being the currently selected team
          this.preventSameTeamSelection();
          break;
        case "season":
          // Reload data when  changes
          this.app.data.load("games", this.app.update);
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
