import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Core from "./src/atom/Core";
import ValenceShell from "./src/atom/ValenceShell";

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true; // Suaviza a movimentação
controls.dampingFactor = 0.25; // Fator de suavização
controls.enableZoom = true; // Habilita o zoom
controls.minDistance = 1; // Distância mínima para o zoom
controls.maxDistance = 10; // Distância máxima para o zoom
controls.mouseButtons.RIGHT = null; // Desativar botão direito

camera.position.set(100, 0, 0);
camera.lookAt(0, 0, 0);

controls.update(); // Atualiza os controles

const scene = new THREE.Scene();

// Adicionando luz ambiente
const light = new THREE.AmbientLight(0xffffff, 2);

scene.add(light);

const normalVector1 = { x: 1, y: 0.5, z: 0 }; // Vetor normal arbitrário
const normalVector2 = { x: 0, y: 0.5, z: 1 }; // Vetor normal arbitrário

const neutrons = [
  new Core(scene, "neutron"),
  new Core(scene, "neutron"),
  new Core(scene, "neutron"),
  new Core(scene, "neutron"),
];

const protons = [
  new Core(scene, "proton"),
  new Core(scene, "proton"),
  new Core(scene, "proton"),
];

const valenceShells = [
  new ValenceShell(scene, 1, normalVector1),
  new ValenceShell(scene, 2, normalVector2),
];

for (let shell of valenceShells) {
  shell.addToScene(scene);
}

function animate() {
  controls.update();

  protons.forEach((proton) => {
    proton.rotate();
  });

  neutrons.forEach((neutron) => {
    neutron.rotate();
  });

  neutrons[0].move("y", 0);
  neutrons[1].move("x", -2);
  neutrons[2].move("y", -2);
  neutrons[3].move("z", -2);

  protons[0].move("x", 2);
  protons[1].move("y", 2);
  protons[2].move("z", 2);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
