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


camera.position.set(50, 0, 0);
camera.lookAt(0, 0, 0);

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

      object.model.scale.set(0.35, 0.35, 0.35);
    });
  }

  rotate() {
    if (this.model) {
      this.model.rotation.x += 0.01;
      this.model.rotation.y += 0.01;
    }
  }
}

class ValenceShell {
  constructor(layer, normalVector) {
    this.layer = layer; // Identifica a camada (1 - K, 2 - L, etc.)
    this.planeNormal = new THREE.Vector3(normalVector.x, normalVector.y, normalVector.z); // Vetor normal fornecido
    this.planeNormal.normalize(); // Transforma o vetor normal passado em unitário

    // inicialiazando os Vetores ortogonais para calcular eles abaixo
    this.orthogonalVector1 = new THREE.Vector3();
    this.orthogonalVector2 = new THREE.Vector3();

    // Calcula os vetores ortogonais
    this.calculateOrthogonalVectors();

    console.log(`Normal do plano: ${this.planeNormal.x}, ${this.planeNormal.y}, ${this.planeNormal.z}`);
    console.log(`Vetor ortogonal 1: ${this.orthogonalVector1.x}, ${this.orthogonalVector1.y}, ${this.orthogonalVector1.z}`);
    console.log(`Vetor ortogonal 2: ${this.orthogonalVector2.x}, ${this.orthogonalVector2.y}, ${this.orthogonalVector2.z}`);
  }

  calculateOrthogonalVectors() {
    // Vetor arbitrário para o produto vetorial 
    let arbitraryVector = new THREE.Vector3(1, 0, 0);

    // Se o vetor normal estiver mais próximo do eixo X, usamos o eixo Y como vetor arbitrário 
    // evitando que o produto vetorial seja zero e o plano não seja definido
    if (Math.abs(this.planeNormal.x) > 0.5) {
      arbitraryVector.set(0, 1, 0);
    }

    // Primeiro vetor ortogonal: produto vetorial entre o vetor normal e o vetor arbitrário
    this.orthogonalVector1.crossVectors(this.planeNormal, arbitraryVector).normalize();

    // crossVectors é uma função que calcula o produto vetorial entre dois vetores
    // normalize é uma função que transforma o vetor resultante em um vetor unitário

    // Segundo vetor ortogonal: produto vetorial entre o vetor normal e o primeiro vetor ortogonal
    this.orthogonalVector2.crossVectors(this.planeNormal, this.orthogonalVector1).normalize();

    // assim os 3 vetores são ortogonais entre si
  }

  // Método para adicionar o plano à cena
  addToScene(scene) {
    const raio = 4 + ((this.layer - 1) * 1.5); // Define o raio do anel com base na camada de valência
    const tubeRadius = 0.07; // Raio da "espessura" da anel
    const radialSegments = 30; // Segmentos ao redor do raio maior
    const tubularSegments = 16; // Segmentos ao longo da espessura do tubo

    // TorusGeometry cria uma geometria em formato de anel
    const geometry = new THREE.TorusGeometry(raio, tubeRadius, tubularSegments, radialSegments);
    const material = new THREE.MeshBasicMaterial({ color: 0x22ff99, side: THREE.DoubleSide }); // Material do anel
    const anel = new THREE.Mesh(geometry, material); // Cria o mesh do anel

    // O plano deve ser definido pelos vetores ortogonais, então usaremos esses vetores para orientar o plano
    anel.lookAt(this.planeNormal); // A face será perpendicular ao vetor normal

    // Rotaciona o plano para alinhar com os vetores ortogonais
    anel.rotateOnAxis(this.orthogonalVector1, Math.PI / 2); //rotação ao longo do primeiro vetor ortogonal
    anel.rotateOnAxis(this.orthogonalVector2, Math.PI / 2); //rotação ao longo do segundo vetor ortogonal

    scene.add(anel);
  }
}

const normalVector1 = { x: 1, y: 0.5, z: 0 }; // Vetor normal arbitrário
const normalVector2 = { x: 0, y: 0.5, z: 1 }; // Vetor normal arbitrário

const valenceShells = [
  new ValenceShell(1, normalVector1),
  new ValenceShell(2, normalVector2)
];

const neutrons = [
  new Atom("neutron"),
  new Atom("neutron"),
  new Atom("neutron"),
  new Atom("neutron"),
];

const protons = [
  new Atom("proton"),
  new Atom("proton"),
  new Atom("proton")
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
