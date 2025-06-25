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

  path(property) {
    const { season, team } = this.app.filters;

    switch (property) {
      case "games":
        return `./data/seasons/${season}/${team}.csv`;
      case "teams":
        return "./data/teams/2024-25.csv";
      case "periods":
        return "./data/periods.csv";
      case "highlights":
        return `./data/highlights/${season}.csv`;
    }
  }

  async load(property, callback) {
    let path = this.path(property);
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
