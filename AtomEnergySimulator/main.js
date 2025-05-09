import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import ValenceShell from "./src/atom/ValenceShell";
import Core from "./src/atom/Core";

// Configuração da Câmera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(100, 0, 0);
camera.lookAt(0, 0, 0);

// Configuração do Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Configuração dos Controles
const controls = new OrbitControls(camera, renderer.domElement);

// Configuração da Cena
const scene = new THREE.Scene();

// Criação do Núcleo
const core = new Core(scene, 3, 4);

// Luz ambiente
const ambientLight = new THREE.AmbientLight(0xffffff, 2);

// Audio
const listener = new THREE.AudioListener();
camera.add(listener);

const soundOfLight = new THREE.Audio(listener);
const soundOfEletric = new THREE.Audio(listener);
let eletricVol = 0.5;

const soundOfLightLoader = new THREE.AudioLoader();
const soundOfEletricLoader = new THREE.AudioLoader();
soundOfLightLoader.load("soundOfLight.mp3", (buffer) => {
  soundOfLight.setBuffer(buffer);
  soundOfLight.setLoop(true);
  soundOfLight.setVolume(2);
});

soundOfEletricLoader.load("soundOfEletric.mp3", (buffer) => {
  soundOfEletric.setBuffer(buffer);
  soundOfEletric.setLoop(true);
  soundOfEletric.setVolume(0.5);
});

// Variáveis do Sistema
let layer = 0;
const values = [1, 2]; // Quantidade de elétrons em cada camada de valência padrão
let energy = 0;
let clickInactive;
const valenceShells = [];
let numberOfValenceShells;
let numberOfValenceShellsAux = 0;
const normalVectors = [
  getRandomVector(),
  getRandomVector(),
  getRandomVector(),
  getRandomVector(),
  getRandomVector(),
  getRandomVector(),
  getRandomVector(),
];

scene.add(ambientLight);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.minDistance = 1;
controls.maxDistance = 10;
controls.mouseButtons.RIGHT = null;
controls.update();

// Criação das Camadas de Valência
function createValenceShells() {
  values.forEach((quantity, i) => {
    const shell = new ValenceShell(scene, ++layer, normalVectors[i], quantity);
    valenceShells.push(shell);
  });
  numberOfValenceShells = valenceShells.length;
  numberOfValenceShellsAux = numberOfValenceShells;
}

// Função para Rotacionar os Elétrons
function rotateElectrons() {
  valenceShells.forEach((shell) => {
    shell.rotateElectrons();
  });
}

// Função para Adicionar Nova Camada de Valência
function addValenceShell() {
  const newShell = new ValenceShell(
    scene,
    ++layer,
    normalVectors[numberOfValenceShellsAux++],
    0
  );
  valenceShells.push(newShell);
  let electrons = [];
  valenceShells.forEach((shell) => {
    electrons.push(shell.electronsQuantity);
  });
  for (let i = 0; i < valenceShells.length; i++) {
    valenceShells[i].removeElectron();
    if (i > 0) {
      valenceShells[i].electronsQuantity = electrons[i - 1];
      valenceShells[i].addElectrons();
    }
  }
}

// Função para Remover Camadas Extras
function removeExtraValenceShells() {
  while (valenceShells.length > numberOfValenceShells) {
    const shell = valenceShells.pop();
    shell.removeValenceShell();
    shell.lightEmission();
    --layer;
  }
}

// Função para Gerar Vetor Normal Aleatório
function getRandomVector() {
  return {
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2,
    z: (Math.random() - 0.5) * 2,
  };
}

// Função de Animação
function animate() {
  controls.update();

  if (!core.allAtomsIsFixed) {
    core.allAtomsFixed();
    core.atoms.forEach((atom) => atom.applyGravity());
  }

  rotateElectrons();
  renderer.render(scene, camera);
}

// Função para Gerenciar o Evento de Clique
function handleMouseClick() {
  clearInterval(clickInactive);
  energy += 0.5;

  if (energy % 2 == 0 && numberOfValenceShellsAux < 7) {
    addValenceShell();
    soundOfEletric.play();
    soundOfEletric.setVolume(++eletricVol);
  }

  clickInactive = setInterval(() => {
    if (energy > 0) {
      energy -= 1;
    } else if (valenceShells.length > numberOfValenceShells) {
      valenceShells.forEach((shell, index) => {
        shell.removeElectron();
        shell.electronsQuantity = values[index];
        shell.addElectronsReturn();
      });
      numberOfValenceShellsAux = numberOfValenceShells;
      clearInterval(clickInactive);
      soundOfLight.play();
      let removeShellsInterval = setInterval(() => {
        removeExtraValenceShells();

        if (valenceShells.length <= numberOfValenceShells) {
          clearInterval(removeShellsInterval);
          soundOfLight.stop(1);
          soundOfEletric.stop(1);
        }
      }, 500);
    }
  }, 2000);
}

// Inicializando o Sistema
createValenceShells();
renderer.setAnimationLoop(animate);

// Evento de Clique
window.addEventListener("click", handleMouseClick);
