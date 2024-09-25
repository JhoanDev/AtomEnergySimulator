import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

camera.position.set(0, 2, 10); // Posição inicial da câmera
controls.update(); // Atualiza os controles

const scene = new THREE.Scene();

// Adicionando luz ambiente
const light = new THREE.AmbientLight(0xffffff, 2);
const speed = 0.1;
let time = 0.1;

scene.add(light);

class Atom {
  constructor(type) {
    this.model = null;
    this.type = type;
    this.load(this);
  }

  move(direction, value) {
    time += speed;

    if (direction == "x" && this.model) {
      this.model.position.x = Math.sin(time) * speed + value;
    } else if (direction == "y" && this.model) {
      this.model.position.y = Math.sin(time) * speed + value;
    } else if (direction == "z" && this.model) {
      this.model.position.z = Math.sin(time) * speed + value;
    }
  }

  load(object) {
    const loader = new GLTFLoader();
    loader.load(`src/models/core/${this.type}.gltf`, (gltf) => {
      scene.add(gltf.scene);

      object.model = gltf.scene.children[0];

      gltf.animations;
      gltf.scene;
      gltf.scenes;
      gltf.cameras;
      gltf.asset;
    });
  }

  rotate() {
    if (this.model) {
      this.model.rotation.x += 0.01;
      this.model.rotation.y += 0.01;
    }
  }
}

const neutrons = [
  new Atom("neutron"),
  new Atom("neutron"),
  new Atom("neutron"),
  new Atom("neutron"),
];

const protons = [new Atom("proton"), new Atom("proton"), new Atom("proton")];

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
