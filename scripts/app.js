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
