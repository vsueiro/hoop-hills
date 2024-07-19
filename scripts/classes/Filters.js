export default class Filters {
  constructor(app) {
    this.app = app;
    this.form = document.querySelector("form");

    this.team = "";
    this.opponent = "";
    this.season = "";
    this.sorting = "";
    this.view = "";
    this.games = [];
    this.results = [];
    this.periods = [];

    this.allValues = {
      opponent: "all",
      games: ["RS", "PI", "PO"],
      results: ["won", "lost"],
      periods: ["Q1", "Q2", "Q3", "Q4", "OTs"],
    };

    this.form.addEventListener("input", () => {
      this.updateFiltersValues();
    });

    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.updateFiltersValues();
    });

    this.updateFiltersValues();
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

  updateFiltersValues() {
    const formData = new FormData(this.form);

    this.team = formData.get("team");
    this.opponent = formData.get("opponent");
    this.season = formData.get("opponent");
    this.sorting = formData.get("sorting");
    this.view = formData.get("view");

    this.games = formData.getAll("games");
    this.results = formData.getAll("results");
    this.periods = formData.getAll("periods");

    console.log(this.view);
  }
}
