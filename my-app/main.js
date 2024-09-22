import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Inicializar OrbitControls
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
scene.add(light);

// Nucleo do átomo
class NuclearModel {
  constructor() {
    this.model = null;
    this.load(this);
  }

  load(object) {
    const loader = new GLTFLoader();
    loader.load(
      'models/core.gltf',
      function (gltf) {
        scene.add(gltf.scene);
        object.model = gltf.scene.children[0];
        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      function (error) {
        console.error('An error happened:', error);
      }
    );
  }
}

const nucleo = new NuclearModel();

function animate() {
  controls.update(); // Atualiza os controles
  nucleo.rotate(); // Rotaciona o modelo
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
