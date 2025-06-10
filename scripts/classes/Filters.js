export default class Filters {
  constructor(app, form = "form") {
    this.app = app;
    this.form = typeof form === "string" ? document.querySelector(form) : form;
    this.element = this.form.closest(".filters"); // May or may not be used later

    this.ccaaSelect = this.form.querySelector('[name="ccaa"]');
    this.selectedCcaa = 'all';

    // Listener for when data is ready in Data.js
    this.app.data.once("ready", () => {
      // console.log('Filters: Data is ready, populating CCAA filter.');
      this.populateCcaaFilter();
      this.update(); // Initial update to reflect "All"
    });

    this.setupEventListeners();
  }

  populateCcaaFilter() {
    if (!this.app.data.electionData) {
      // console.error("Election data not available to populate CCAA filter.");
      return;
    }

    const ccaas = [...new Set(this.app.data.electionData.map(item => item.ccaa))].sort();
    // console.log('Unique CCAAs for filter:', ccaas);

    // Keep the "All Communities" option, clear others
    while (this.ccaaSelect.options.length > 1) {
      this.ccaaSelect.remove(1);
    }

    ccaas.forEach(ccaa => {
      const option = document.createElement('option');
      option.value = ccaa;
      option.textContent = ccaa;
      this.ccaaSelect.appendChild(option);
    });
    if (this.app.stats) {
        this.app.stats.update(this.app.data.electionData, 'all');
    }
  }

  setupEventListeners() {
    this.form.addEventListener("input", (event) => {
      if (event.target.name === "ccaa") {
        this.update();
      }
    });
  }

  update() {
    const formData = new FormData(this.form);
    this.selectedCcaa = formData.get("ccaa");
    // console.log('Filters updated. Selected CCAA:', this.selectedCcaa);

    // Notify the chart to update (ElectionChart will need a method for this)
    if (this.app.world && this.app.world.electionChart) {
      this.app.world.electionChart.filterAndRedraw({ ccaa: this.selectedCcaa });
    }
    if (this.app.stats) {
      // Pass the chart's current data and the selected CCAA to Stats.update
      const chartData = this.app.world.electionChart.currentData;
      this.app.stats.update(chartData, this.selectedCcaa);
    }

    // Update URL params if Params class is to be kept and adapted
    // if (this.app.params) {
    //   this.app.params.update(formData); // This might need adjustment or removal
    // }

    // Trigger idle reset if that system is kept
    // if (this.app.world && this.app.world.idle) {
    //   this.app.world.idle.reset();
    // }
  }

  // Collapse functionality, can be kept if desired, or removed if not needed.
  collapse(force = undefined) {
    if (!this.element) return;
    const collapsed = this.element.classList.toggle("collapsed", force);

    // If stories are removed, this part is not needed
    // if (collapsed === false && this.app.stories && this.app.stories.current !== 0) {
    //   this.app.stories.set(0);
    // }
  }
}
