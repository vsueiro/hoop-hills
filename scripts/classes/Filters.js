export default class Filters {
  constructor(app, form = "form") {
    this.app = app;

    this.form = typeof form === "string" ? document.querySelector(form) : form;

    this.teamSelector = this.form.querySelector('[name="team"]');
    this.opponentSelector = this.form.querySelector('[name="opponent"]');
    this.seasonSelector = this.form.querySelector('[name="season"]');

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

  setup() {
    // Handle form submission
    this.form.addEventListener("input", () => {
      this.update();
    });

    // this.form.addEventListener("submit", (event) => {
    //   event.preventDefault();
    //   this.update();
    // });

    // Reload data when team or season changes
    this.teamSelector.addEventListener("input", () => {
      this.app.data.load("games", this.app.update);
    });

    this.seasonSelector.addEventListener("input", () => {
      this.app.data.load("games", this.app.update);
    });

    // Prevent opponent from being the currently selected team
    this.teamSelector.addEventListener("input", () => {
      for (let option of this.opponentSelector.options) {
        option.hidden = option.value === this.teamSelector.value;
      }

      if (this.opponentSelector.value === this.teamSelector.value) {
        this.opponentSelector.value = "all";
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
