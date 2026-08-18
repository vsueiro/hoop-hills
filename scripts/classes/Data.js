import { csv, autoType } from "d3";

export default class Data {
  constructor(app) {
    this.app = app;

    this.dependencies = {
      periods: {
        loaded: false,
      },
      teams: {
        loaded: false,
      },
      games: {
        loaded: false,
      },
    };

    // List years of team files — should match those CSV in `./data/teams/`
    this.teamsSince = [
      2015,
      2014,
      2013,
      2009,
      2008,
      2006,
      2005,
      2003,
      2002,
      1998,
      1996,
      1990,
    ];

    this.events = {};
  }

  get loadedCount() {
    return Object.values(this.dependencies).filter((d) => d.loaded).length;
  }

  get dependencyCount() {
    return Object.keys(this.dependencies).length;
  }

  get isReady() {
    return this.loadedCount === this.dependencyCount;
  }

  on(event, callback) {
    this.events[event] = callback;
  }

  once(event, callback) {
    this.events[event] = () => {
      callback();
      delete this.events[event];
    };
  }

  emit(event) {
    if (event in this.events) {
      this.events[event]();
    }
  }

  getTeamsFile(year, teamsPath = "") {
    // Ensure list is sorted from most recent to oldest
    this.teamsSince.sort((a, b) => b - a);

    // Assume no match is found (pick oldest team list by default)
    let match = this.teamsSince.at(-1);

    // Get teams that existed in target year
    for (const sinceYear of this.teamsSince) {
      if (sinceYear <= year) {
        match = sinceYear;
        break;
      }
    }

    // Build filename for CSV
    return `${teamsPath}since-${match}.csv`;
  }

  getHighlightsFile(year, highlightsPath = "") {
    // Only support video highlights since 2014-15 season
    if (year < 2015) return false;

    // Build filename for CSV
    return `${highlightsPath}${year}.csv`;
  }

  path(property) {
    const { season, team } = this.app.filters;

    switch (property) {
      case "games":
        return `./data/seasons/${season}/${team}.csv`;
      case "teams":
        return this.getTeamsFile(season, "./data/teams/");
      case "periods":
        return "./data/periods.csv";
      case "highlights":
        return this.getHighlightsFile(season, "./data/highlights/");
    }
  }

  async load(property, callback) {
    let path = this.path(property);

    // Avoid going further if path is falsey?
    if (!path) return;

    this[property] = await csv(path, autoType);

    if (property in this.dependencies) {
      this.dependencies[property].loaded = true;
    }

    if (callback) {
      callback();
      return;
    }

    if (this.isReady) {
      this.emit("ready");
    }
  }
}
