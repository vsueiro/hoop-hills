export default class Filters {
  constructor(app, form = "form") {
    this.app = app;

    this.form = typeof form === "string" ? document.querySelector(form) : form;
    this.element = this.form.closest(".filters");

    this.teamSelector = this.form.querySelector('[name="team"]');
    this.opponentSelector = this.form.querySelector('[name="opponent"]');

    this.dateInput = this.form.querySelector('[name="date"]');
    this.dateOutput = this.dateInput.parentElement.querySelector("output");
    this.dateInputPin = this.dateInput.parentElement.querySelector(".pin");

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

  setRandomTeam() {
    const options = this.teamSelector.options;
    const index = Math.floor(Math.random() * options.length);
    this.teamSelector.selectedIndex = index;
  }

  setPeriods(list = ["Q1", "Q2", "Q3", "Q4", "OT"]) {
    const checkboxes = this.form.querySelectorAll('[name="periods"]');

    for (let checkbox of checkboxes) {
      checkbox.checked = list.includes(checkbox.value);
    }

    this.update();
  }

  setResults(list = ["won", "lost"]) {
    const checkboxes = this.form.querySelectorAll('[name="results"]');

    for (let checkbox of checkboxes) {
      checkbox.checked = list.includes(checkbox.value);
    }

    // this.update();
  }

  setRounds(list = ["RS", "PI", "PO"]) {
    const checkboxes = this.form.querySelectorAll('[name="rounds"]');

    for (let checkbox of checkboxes) {
      checkbox.checked = list.includes(checkbox.value);
    }

    // this.update();
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

  setOpponent(value = "all") {
    this.opponentSelector.value = value;
  }

  // setDate(index = null) {
  //   if (index === null) {
  //     this.dateInput.value = 0;
  //     this.dateInput.dataset.picked = false;
  //     return;
  //   }

  //   this.setIDs(group.userData.id);

  //   this.dateInput.value = index;
  //   this.dateInput.dataset.picked = true;
  //   const percentage = (index / this.dateInput.max) * 100;
  //   this.dateInputPin.style.left = `${percentage}%`;
  //   const group = this.app.world.hills.groups[index];

  // }

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

  disableDates() {
    this.dateInput.max = this.app.world.summaries.list.length - 1;
  }

  disableUnavailables() {
    this.disableSameTeam();
    this.disableUnplayedRound();
    this.disableDates();

    this.update();
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

        // Reload games data when team changes
        this.app.data.load("games", () => {
          this.app.world.build();
          this.disableUnavailables();
        });

        // Clear Game ID filter
        this.setIDs();
        break;

      case "season":
        this.app.world.hills.hideAll = true;

        // Reload teams info when season changes
        this.app.data.load("teams", () => {

          // Add new teams as options in selectors
          this.populateTeams();

          // Then, reload games data
          this.app.data.load("games", () => {
            this.app.world.build();
            this.disableUnavailables();
          });

        });

        // Load video highlights data when season changes
        this.app.data.load("highlights", () => {
          this.app.videos.update();
        });

        // Clear Game ID filter
        this.setIDs();
        break;

      case "opponent":
        // Clear Game ID filter
        this.setIDs();
        break;

      case "date":
        // Find hill group by index (sorted by date)
        const index = parseInt(this.dateInput.value);
        const group = this.app.world.hills.groups[index];
        this.updateTimeline(index);
        this.setIDs(group.userData.id);
        // Ensure all opponents are selected
        this.setOpponent();

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

  resetTimeline() {
    this.dateInput.value = 0;
    this.dateOutput.textContent = "All dates";
  }

  updateTimeline(index) {
    const group = this.app.world.hills.groups[index];
    this.dateOutput.textContent = group.userData.date;
  }

  updateVideo(index) {
    if (index === undefined) {
      this.app.videos?.update();
      return;
    }

    const group = this.app.world.hills.groups[index];
    const { id } = group.userData;
    this.app.videos.update(id);
  }

  populateTeams() {
    const selects = [this.teamSelector, this.opponentSelector];

    selects.forEach(select => {

      // Remember currently-selected value
      const currentValue = select.value;
      const currentText = currentValue ? select.options[select.selectedIndex].text : "";

      // Clear options
      select.replaceChildren();

      // Add default selected option for opponent selector
      if (select.name === "opponent") {
        const option = document.createElement("option");
        option.value = "all";
        option.textContent = "All other teams";
        select.append(option);
      }

      // Adds each team as an option
      this.app.data.teams.forEach(team => {
        const option = document.createElement("option");
        option.value = team.id;
        option.textContent = team.name;
        select.append(option);
      });

      // If there was no previous value
      if (currentValue === "") {
        // Pick first option
        select.selectedIndex = 0;
        // Stop checking further
        return;
      }

      // Try to set current value (if any) to newly-populated select
      select.value = currentValue;

      // Otherwise, the option does not exist anymore
      if (select.value === "") {
        
        // Pick first option
        select.selectedIndex = 0;

        // TODO: Improve warning message and/or pick best alternative (e.g., Bullets -> Wizards)
        alert(`Team ${currentText} is not in season ending in ${this.season}`);
      }
      
    })

    this.update();
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
    this.date = formData.get("date");

    this.rounds = formData.getAll("rounds");
    this.results = formData.getAll("results");
    this.periods = formData.getAll("periods");

    // TEMP: Comma separated list of game ids
    this.ids = formData
      .get("ids")
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id !== "");

    // If showing a single game
    if (this.ids.length === 1) {
      const [id] = this.ids;
      const index = this.app.world.summaries.list.findIndex((summary) => summary.id === id);
      this.updateTimeline(index);
      this.updateVideo(index);
    } else {
      this.resetTimeline();
      this.updateVideo();
    }
  }
}
