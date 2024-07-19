import * as d3 from "d3";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let renderer, scene, camera, controls;
let teams, plays, ids, order;
let currentTransition = null; // Track the current transition interval

const views = {
  bars: { theta: Math.PI / 2, phi: Math.PI / 2 },
  grid: { theta: Math.PI / 2, phi: 0 },
  lines: { theta: 0, phi: Math.PI / 2 },
  corner: { theta: Math.PI / 4, phi: Math.PI / 3 },
};

const radius = 24; // Distance from the origin

function setup() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  const frustumSize = 12;
  const aspect = window.innerWidth / window.innerHeight;
  const halfFrustumWidth = (frustumSize * aspect) / 2;
  const halfFrustumHeight = frustumSize / 2;

  camera = new THREE.OrthographicCamera(
    -halfFrustumWidth,
    halfFrustumWidth,
    halfFrustumHeight,
    -halfFrustumHeight,
    1,
    2000
  );
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = true; // Ensure rotation is enabled
  controls.enableZoom = true; // Enable zooming
  controls.enablePan = false; // Enable panning

  // Add event listeners to OrbitControls to stop the transition when user interacts
  controls.addEventListener("start", () => {
    if (currentTransition !== null) {
      clearInterval(currentTransition);
      currentTransition = null;
    }
  });

  // Set initial camera position
  camera.position.setFromSphericalCoords(
    radius,
    views.corner.phi,
    views.corner.theta
  );
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  createTiles();

  window.addEventListener("resize", onWindowResize, false);

  animate();
}

function createTiles() {
  // Limit to elapsed seconds of 4 quarters
  const xLimit = 2880; // d3.max(plays, (d) => d.elapsedTime)

  // Create the X scale
  const xScale = d3.scaleLinear().domain([0, xLimit]).range([-5, 5]);

  const widthScale = d3.scaleLinear().domain([0, xLimit]).range([0, 10]);

  // Create the Y scale

  // Find the maximum and minimum values
  const [min, max] = d3.extent(plays, (d) => d.pointDifference);

  // Dynamic Scale
  // const maxAbs = Math.max(Math.abs(max), Math.abs(min));
  // const yAbs = 0.05 * max;

  // Absolute Scale
  const maxAbs = 60;
  const yAbs = 2;

  const depth = 0.1;

  // Create yScale
  const yScale = d3
    .scaleLinear()
    .domain([-maxAbs, maxAbs])
    .range([-yAbs / 2, yAbs / 2]);

  const heightScale = d3.scaleLinear().domain([0, maxAbs]).range([0, yAbs]);

  // Create the Z scale
  const zScale = d3.scalePoint().domain(ids).range([5, -5]); // .padding(0.5);

  // Create color scale
  const colorScalePositive = d3
    .scaleSequential()
    .domain([maxAbs * 1, 1])
    .interpolator(d3.interpolateBlues);

  const colorScaleNegative = d3
    .scaleSequential()
    .domain([maxAbs * -1, -1])
    .interpolator(d3.interpolateReds);

  function getColor(pointDifference) {
    if (pointDifference === 0) {
      return "rgb(0,0,0)";
    }

    if (pointDifference > 0) {
      return colorScalePositive(pointDifference);
    }

    if (pointDifference < 0) {
      return colorScaleNegative(pointDifference);
    }
  }

  let smoothPointDifference = 0;

  // Create grid lines

  const yOffset = 0.01;
  const zOffset = depth * 2.5;

  const gridLines = [
    {
      label: "Start of Q1",
      coords: [
        [xScale(0), yOffset, zScale(ids.at(0)) + zOffset],
        [xScale(0), yOffset, zScale(ids.at(-1)) - zOffset],
      ],
    },
    {
      label: "End of Q1",
      coords: [
        [xScale(60 * 12 * 1), yOffset, zScale(ids.at(0)) + zOffset],
        [xScale(60 * 12 * 1), yOffset, zScale(ids.at(-1)) - zOffset],
      ],
    },
    {
      label: "End of Q2",
      coords: [
        [xScale(60 * 12 * 2), yOffset, zScale(ids.at(0)) + zOffset],
        [xScale(60 * 12 * 2), yOffset, zScale(ids.at(-1)) - zOffset],
      ],
    },
    {
      label: "End of Q3",
      coords: [
        [xScale(60 * 12 * 3), yOffset, zScale(ids.at(0)) + zOffset],
        [xScale(60 * 12 * 3), yOffset, zScale(ids.at(-1)) - zOffset],
      ],
    },
    {
      label: "End of Q4",
      coords: [
        [xScale(60 * 12 * 4), yOffset, zScale(ids.at(0)) + zOffset],
        [xScale(60 * 12 * 4), yOffset, zScale(ids.at(-1)) - zOffset],
      ],
    },
    {
      label: "End of OT1",
      coords: [
        [
          xScale(60 * 12 * 4 + 60 * 5 * 1),
          yOffset,
          zScale(ids.at(0)) + zOffset,
        ],
        [
          xScale(60 * 12 * 4 + 60 * 5 * 1),
          yOffset,
          zScale(ids.at(-1)) - zOffset,
        ],
      ],
    },
    {
      label: "End of OT2",
      coords: [
        [
          xScale(60 * 12 * 4 + 60 * 5 * 2),
          yOffset,
          zScale(ids.at(0)) + zOffset,
        ],
        [
          xScale(60 * 12 * 4 + 60 * 5 * 2),
          yOffset,
          zScale(ids.at(-1)) - zOffset,
        ],
      ],
    },
  ];

  for (let gridLine of gridLines) {
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
    });

    const points = [];

    for (let coord of gridLine.coords) {
      const point = new THREE.Vector3(...coord);
      points.push(point);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
  }

  // Create tiles

  for (let i = 0; i < plays.length; i++) {
    const play = plays[i];
    let nextPlay = plays[i + 1];

    if (nextPlay && nextPlay.id !== play.id) {
      nextPlay = undefined;
    }

    // // TEMP: Show only one game
    // if (play.id !== "202404170PHI") {
    //   continue;
    // }

    const playDuration = nextPlay ? nextPlay.elapsedTime - play.elapsedTime : 0;

    let smoothFactor = 1; // 0–1

    if (play.elapsedTime === 0) {
      smoothPointDifference = 0;
    } else {
      smoothPointDifference =
        smoothPointDifference +
        (play.pointDifference - smoothPointDifference) * smoothFactor;
    }

    // smoothPointDifference = play.pointDifference;

    // Create the box geometry with custom dimensions
    const width = widthScale(playDuration);
    // const height = heightScale(Math.abs(play.pointDifference));
    const height = heightScale(Math.abs(smoothPointDifference));

    const geometry = new THREE.BoxGeometry(width, height, depth);

    // Create a material
    const material = new THREE.MeshBasicMaterial({
      color: getColor(play.pointDifference),
    });

    // Create a mesh with the geometry and material
    const box = new THREE.Mesh(geometry, material);

    // Set position of the box
    box.position.set(
      xScale(play.elapsedTime) + width / 2,
      // yScale(play.pointDifference),
      yScale(smoothPointDifference),
      zScale(play.id)
    );

    scene.add(box);

    // Add sphere to mark final score
    if (nextPlay === undefined) {
      const width = widthScale(1);
      const height = heightScale(0.5);
      const geometry = new THREE.BoxGeometry(width, height, depth);

      // Create a material
      const material = new THREE.MeshBasicMaterial({
        color: "rgb(255,255,255)",
      });

      // Create a mesh with the geometry and material
      const box = new THREE.Mesh(geometry, material);

      // Set position of the box
      box.position.set(
        xScale(play.elapsedTime) + width / 2,
        yScale(smoothPointDifference) * 2,
        zScale(play.id)
      );

      scene.add(box);
    }
  }
}

function onWindowResize() {
  const aspect = window.innerWidth / window.innerHeight;
  const frustumSize = 12;
  const halfFrustumWidth = (frustumSize * aspect) / 2;
  const halfFrustumHeight = frustumSize / 2;

  camera.left = -halfFrustumWidth;
  camera.right = halfFrustumWidth;
  camera.top = halfFrustumHeight;
  camera.bottom = -halfFrustumHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

document.querySelectorAll("button[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    const view = views[button.dataset.view];
    const targetPosition = new THREE.Vector3().setFromSphericalCoords(
      radius,
      view.phi,
      view.theta
    );
    transitionCamera(targetPosition);
  });
});

function transitionCamera(targetPosition) {
  if (currentTransition !== null) {
    clearInterval(currentTransition); // Clear the existing transition if there is one
    currentTransition = null;
  }

  const startPosition = camera.position.clone(); // Preserve initial position
  const startQuaternion = camera.quaternion.clone(); // Preserve initial quaternion

  // Move camera to target position to calculate the end quaternion
  camera.position.copy(targetPosition);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  const endQuaternion = camera.quaternion.clone();

  // Reset camera to start position and quaternion
  camera.position.copy(startPosition);
  camera.quaternion.copy(startQuaternion);

  let t = 0;
  const duration = 1000; // Transition duration in ms
  currentTransition = setInterval(() => {
    t += 10;
    const easedT = easeInOutCubic(t / duration);
    camera.position.lerpVectors(startPosition, targetPosition, easedT);
    camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, easedT);
    if (t >= duration) {
      clearInterval(currentTransition);
      currentTransition = null;
      camera.position.copy(targetPosition);
      camera.quaternion.copy(endQuaternion);
    }
  }, 10);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

async function loadData() {
  // Create team selector
  teams = await d3.csv("data/2024-teams.csv", d3.autoType);

  // Sort alphabetically by short name
  teams.sort((a, b) => a.short.localeCompare(b.short));

  const params = new URLSearchParams(window.location.search);

  for (let team of teams) {
    const option = document.createElement("option");

    option.value = team.code;

    option.textContent = team.short;

    selectTeam.append(option);

    if (params.has("team")) {
      option.selected = team.code === params.get("team") ? true : false;
    } else {
      option.selected = team.code === "MIA" ? true : false;
    }
  }

  selectTeam.onchange = () => {
    params.set("team", selectTeam.value);
    window.location.search = params.toString();
  };

  plays = await d3.csv(`data/2024-${selectTeam.value}-viz.csv`, d3.autoType);

  const playsReversed = plays.toReversed();

  ids = Array.from(new Set(plays.map((d) => d.id)));
  // console.log(ids);

  order = [];

  for (let id of ids) {
    order.push({
      id,
      diff: playsReversed.find((d) => d.id === id).pointDifference,
    });
  }

  // Sort by final points difference
  order.sort((a, b) => a.diff - b.diff);

  // Get ids again, but now in the order of the sorted array by game diff
  ids = Array.from(new Set(order.map((d) => d.id)));

  setup();
  // draw();
}

loadData();
