import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import ValenceShell from "./src/atom/ValenceShell";
import Core from "./src/atom/Core";

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
const normalVector2 = { x: 0, y: 1, z: 0 }; // Vetor normal arbitrário


const valenceShells = [
  new ValenceShell(scene, 1, normalVector1, 2),
  new ValenceShell(scene, 2, normalVector2, 1),
];

const core = new Core(scene, 3, 4);

function animate() {
  controls.update();
  if (!core.allAtomsIsFixed) {
    core.allAtomsFixed();
    for (const atom of core.atoms) {
      atom.applyGravity();
    }
  }
  for (const valenceShell of valenceShells) {
    valenceShell.rotacionarEletrons();
  }
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);