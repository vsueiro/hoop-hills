import { csv, autoType } from "d3";

export default class Data {
  constructor(app) {
    this.app = app;

    this.dependencies = {
      electionData: {
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

  path(dependency) {
    switch (dependency) {
      case "electionData":
        return "./data/election_data.csv";
    }
  }

  async load(property, callback) {
    if (!property in this.dependencies) {
      return;
    }

    let path = this.path(property);
    this.electionData = await csv(path, autoType);

    this.dependencies[property].loaded = true;

    if (callback) {
      callback();
      return;
    }

    if (this.isReady) {
      this.emit("ready");
    }
  }
}
