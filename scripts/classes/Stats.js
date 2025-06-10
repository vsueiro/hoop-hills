export default class Stats {
  constructor(app, containerSelector = ".stats") {
    this.app = app;
    this.container = document.querySelector(containerSelector);

    if (!this.container) {
      // console.error('Stats container not found:', containerSelector);
      return;
    }
    this.container.hidden = false; // Ensure it's visible

    this.totalPopulationEl = this.container.querySelector("#stats-total-population");
    this.totalVotesEl = this.container.querySelector("#stats-total-votes");
    this.selectedRegionEl = this.container.querySelector("#stats-selected-region");

    // console.log('Stats module initialized.');
    // Initial update or listen for data/filter changes
    this.app.data.once("ready", () => this.update());
  }

  update(filteredData, selectedCcaa = 'all') {
    let dataToProcess = [];

    if (filteredData) {
      dataToProcess = filteredData;
    } else if (this.app.data && this.app.data.electionData) {
      dataToProcess = this.app.data.electionData;
    }

    if (dataToProcess.length === 0 && selectedCcaa !== 'all') {
      // If filtered data is empty (e.g. a CCAA with no direct data in a specific view)
      // but a CCAA is selected, we might want to show 0s or specific message
      // For now, let's get overall totals if filtered set is empty.
       if (this.app.data && this.app.data.electionData) {
         // this logic might be too simplistic if we expect filteredData to always be the source
         // dataToProcess = this.app.data.electionData;
       }
    }

    let totalPopulation = 0;
    let totalVotes = 0;

    if (dataToProcess && dataToProcess.length > 0) {
        totalPopulation = dataToProcess.reduce((sum, item) => sum + (Number(item.population) || 0), 0);
        totalVotes = dataToProcess.reduce((sum, item) => sum + (Number(item.votes) || 0), 0);
    }

    if (this.totalPopulationEl) {
      this.totalPopulationEl.textContent = `Total Population: ${totalPopulation.toLocaleString()}`;
    }
    if (this.totalVotesEl) {
      this.totalVotesEl.textContent = `Total Votes: ${totalVotes.toLocaleString()}`;
    }
    if (this.selectedRegionEl) {
      this.selectedRegionEl.textContent = `Selected Region: ${selectedCcaa === 'all' ? 'All Communities' : selectedCcaa}`;
    }
    // console.log('Stats updated:', { totalPopulation, totalVotes, selectedCcaa });
  }
}
