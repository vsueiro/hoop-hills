import { csv } from "d3";

async function init() {
  const data = await csv("./data/sample.csv");

  for (let row of data) {
    console.log(row.a, row.b);
  }
}

init();
