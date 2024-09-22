import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

class Particle {
  constructor() {
    this.model = null;
    this.load(this);
  }

  load(object) {
    const loader = new GLTFLoader();
    loader.load(
      'models/neutron.gltf',
      function (gltf) {
        console.log('Model loaded:', gltf);
        scene.add(gltf.scene);
        object.model = gltf.scene.children[0];
        gltf.scene.scale.set(1, 1, 1); // ajuste a escala
        gltf.scene.position.set(0, 0, 0); // ajuste a posição
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

camera.position.z = 5;

const light = new THREE.AmbientLight(0xffffff, 1); // luz ambiente
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // luz direcional
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

let neutron = new Particle();

function animate() {
  renderer.render(scene, camera);
  if (neutron.model) { // verifique se o modelo foi carregado
    neutron.model.rotation.x += 0.01; 
    neutron.model.rotation.y += 0.01;
  }
}

renderer.setAnimationLoop(animate);
