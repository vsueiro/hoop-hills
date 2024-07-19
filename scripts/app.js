import { csv } from "d3";

window.app = {};

let data = [];
let view = "corner";

const form = document.querySelector("form");
const teamSelector = form.querySelector('[name="team"]');
const opponentSelector = form.querySelector('[name="opponent"]');
const seasonSelector = form.querySelector('[name="season"]');
const cubeViews = document.querySelectorAll(".cube [data-view]");

for (let cubeView of cubeViews) {
  cubeView.addEventListener("click", () => {
    for (let other of cubeViews) {
      other.classList.remove("active");
    }

    cubeView.classList.add("active");

    view = cubeView.dataset.view;
    console.log(view);
  });
}

function highlightData() {
  // Visually hide or show three.js objects based on filters
  // team ✅
  // season ✅
  // opponent
  // games
  // result
  // periods
  // Sort three.js objects based on date or win margin
  // sorting
}

async function loadData() {
  console.log("Loading…");

  const team = teamSelector.value;
  const season = seasonSelector.value;
  const url = `./data/seasons/${season}/${team}.csv`;

  data = await csv(url);
  console.log(data);

  highlightData();
}

// Prevent opponent from being the currently selected team
teamSelector.addEventListener("input", () => {
  for (let option of opponentSelector.options) {
    option.hidden = option.value === teamSelector.value;
  }

  if (opponentSelector.value === teamSelector.value) {
    opponentSelector.value = "all";
  }

  loadData();
});

seasonSelector.addEventListener("input", () => {
  loadData();
});

loadData();

/*

// import './styles/main.css';

import { csv } from "d3";
import * as THREE from "three";

const canvas = document.querySelector("#canvas");
const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const sizes = {
  width: 800,
  height: 600,
};

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);

async function init() {
  const teamFilter = document.querySelector("#filter-team");
  const teams = await csv("./data/teams/2024-25.csv");

  for (let team of teams) {
    const option = `<option value="${team.id}">${team.name}</option>`;
    teamFilter.insertAdjacentHTML("beforeend", option);

    // console.log(team.id, team.name, team.nick);
  }
}

init();

*/
