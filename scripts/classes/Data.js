import { csv, autoType } from "d3";

export default class Data {
  constructor(app) {
    this.app = app;
    this.teams = [];
    this.games = [];
  }

  async load(property, callback) {
    const paths = {
      teams: this.teamsPath,
      games: this.gamesPath,
    };

    if (property in paths) {
      let path = paths[property];
      this[property] = await csv(path, autoType);

      if (callback) {
        callback();
      }
    }
  }

  get teamsPath() {
    return "./data/teams/2024-25.csv";
  }

  get gamesPath() {
    const { season, team } = this.app.filters;
    return `./data/seasons/${season}/${team}.csv`;
  }
}
