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
let vector = {
  x: getRandomInt(0, 2),
  y: getRandomInt(1, 2),
  z: getRandomInt(2, 3),
}; // Vetor normal arbitrário
let layer = 1;

let quantInShellOne = 1;
let quantInShellTwo = 2;
let count = 0;
let clickInactive;

let values = [quantInShellOne, quantInShellTwo];

const valenceShells = [
  new ValenceShell(scene, layer, normalVector1, quantInShellOne),
  new ValenceShell(scene, ++layer, normalVector2, quantInShellTwo),
];

const numberOfValenceShells = valenceShells.length;

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
    valenceShell.rotateElectrons();
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("click", () => {
  clearInterval(clickInactive);
  count += 0.5;

  if (Number.isInteger(count)) {
    valenceShells.push(new ValenceShell(scene, ++layer, vector, 0));

    for (let index = 0; index < valenceShells.length; index++) {
      const element = valenceShells[index];

      element.removeElectron();

      if (index != 0) {
        element.electronsQuantity = values[index - 1];
        element.addElectrons();
      }
    }
  }

  clickInactive = setInterval(() => {
    if (count != 0) count -= 0.5;
    else if (count === 0 && valenceShells.length != numberOfValenceShells) {
      valenceShells.map((valenceShell, key) => {
        valenceShell.removeElectron();
        valenceShell.electronsQuantity = values[key];
        valenceShell.addElectrons();
      });

      do {
        valenceShells[valenceShells.length - 1].removeValenceShell();
        valenceShells.pop();
      } while (valenceShells.length > numberOfValenceShells);

      clearInterval(clickInactive);
    }
  }, 1000);
});

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);

  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
