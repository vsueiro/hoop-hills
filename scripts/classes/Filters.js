export default class Filters {
  constructor(app, form = "form") {
    this.app = app;

    this.form = typeof form === "string" ? document.querySelector(form) : form;
    this.element = this.form.closest(".filters");

    this.teamSelector = this.form.querySelector('[name="team"]');
    this.opponentSelector = this.form.querySelector('[name="opponent"]');

    this.setup();
    this.update();
  }

  setIDs(ids = "") {
    const input = this.form.querySelector('[name="ids"]');

    if (typeof ids === "string") {
      input.value = ids;
    } else if (Array.isArray(ids)) {
      input.value = ids.join(",");
    }

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

  setPeriods(list = ["Q1", "Q2", "Q3", "Q4", "OT"]) {
    const checkboxes = this.form.querySelectorAll('[name="periods"]');

    for (let checkbox of checkboxes) {
      checkbox.checked = list.includes(checkbox.value);
    }

    this.update();
  }

  isAll(field) {
    const values = {
      opponent: "all",
      rounds: ["RS", "PI", "PO"],
      results: ["won", "lost"],
      periods: ["Q1", "Q2", "Q3", "Q4", "OT"],
      ids: [],
    };

    if (typeof this[field] === "string") {
      return this[field] === values[field];
    }

    const isArrayEqual =
      this[field].length === values[field].length &&
      this[field].every((value, index) => value === values[field][index]);

    return isArrayEqual;
  }

  disableSameTeam() {
    for (let option of this.opponentSelector.options) {
      option.disabled = option.value === this.teamSelector.value;
    }

    if (this.opponentSelector.value === this.teamSelector.value) {
      this.opponentSelector.value = "all";
    }
  }

  disableUnplayedRound() {
    const checkboxes = this.form.querySelectorAll('[name="rounds"]');

    const played = {
      PI: false,
      PO: false,
    };

    const { list } = this.app.world.summaries;

    for (let i = list.length - 1; i >= 0; i--) {
      const game = list[i];
      if (game.type === "RS") break;
      played[game.type] = true;
    }

    for (let checkbox of checkboxes) {
      const round = checkbox.value;
      if (round in played) {
        checkbox.checked = played[round];
        checkbox.disabled = !played[round];
      }
    }
  }

  disableUnavailables() {
    this.disableSameTeam();
    this.disableUnplayedRound();
  }

  handleFormInput(name) {
    this.update();

    switch (name) {
      case "view":
        // Allow camera animation on view selection
        this.app.world.camera.isUserRotating = false;
        this.app.world.camera.isUserZooming = false;
        break;

      case "team":
        this.app.world.hills.hideAll = true;

        // Reload data when team changes
        this.app.data.load("games", () => {
          this.app.world.build();
          this.disableUnavailables();
        });

        // Clear Game ID filter
        this.setIDs();
        break;

      case "season":
        this.app.world.hills.hideAll = true;

        // Reload data when season changes
        this.app.data.load("games", () => {
          this.app.world.build();
          this.disableUnavailables();
        });

        // Clear Game ID filter
        this.setIDs();
        break;

      case "opponent":
        // Clear Game ID filter
        this.setIDs();
        break;
    }

    this.app.world.idle.reset();
  }

  collapse(force = undefined) {
    const collapsed = this.element.classList.toggle("collapsed", force);

    if (collapsed === false && this.app.stories.current !== 0) {
      this.app.stories.set(0);
    }
  }

  setup() {
    if (window.innerWidth <= 480) {
      this.collapse(true);
    }

    this.form.addEventListener("input", (event) => {
      const name = event.target.name;
      this.handleFormInput(name);
    });
  }

  update() {
    const formData = new FormData(this.form);

    this.team = formData.get("team");
    this.opponent = formData.get("opponent");
    this.season = formData.get("season");
    this.sorting = formData.get("sorting");
    this.view = formData.get("view");

    this.rounds = formData.getAll("rounds");
    this.results = formData.getAll("results");
    this.periods = formData.getAll("periods");

    // TEMP: Comma separated list of game ids
    this.ids = formData
      .get("ids")
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");

    this.app.params.update(formData);
  }
}
