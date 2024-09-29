import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const speed = 0.1;
let theta = 0.1;

export default class AtomStructure {
  constructor(scene, type, core, radius = 0.35) {
    this.scene = scene;
    this.model = null;
    this.type = type;
    this.core = core;
    this.radius = radius;
    this.fixed = false;
    this.position = new THREE.Vector3(); // Armazenar a posição antes do carregamento
    this.velocity = new THREE.Vector3(0, 0, 0); // Velocidade inicial
    this.load(this);
  }

  load(object) {
    const loader = new GLTFLoader();
    loader.load(`src/models/${this.type}.gltf`, (gltf) => {
      object.model = gltf.scene.children[0];
      object.model.scale.set(this.radius, this.radius, this.radius);
      object.model.position.copy(this.position); // Aplicar a posição após o carregamento
      this.scene.add(object.model);
    });
  }

  setPosition(position) {
    this.position.copy(position); // Armazena a posição
    if (this.model) {
      // Se o modelo já estiver carregado, aplicamos diretamente a posição
      this.model.position.copy(position);
    }
  }

  rotate() {
    if (this.model) {
      this.model.rotation.x += 0.01;
      this.model.rotation.y += 0.01;
    }
  }

  // Método para aplicar a gravidade
  applyGravity() {
    if (!this.fixed) {
      const gravityDirection = new THREE.Vector3(0, 0, 0)
        .sub(this.position)
        .normalize(); // Direção da gravidade
      const gravityStrength = 0.01; // Força da gravidade
      this.velocity.add(gravityDirection.multiplyScalar(gravityStrength)); // Atualiza a velocidade
      this.position.add(this.velocity); // Atualiza a posição
      if (this.model) {
        this.model.position.set(this.position); // Atualiza a posição do model
      }
      this.checkCollision();
    }
  }

  checkCollision() {
    for (const atom of this.core.atoms) {
      if (atom !== this) {
        const distance = this.position.distanceTo(atom.position);
        if (distance < this.core.minDistance) {
          // Colisão detectada
          this.fixed = true; // Fixa a partícula
          this.velocity.set(0, 0, 0); // Zera a velocidade
        }
      }
    }
  }

  rotate() {
    if (this.model) {
      this.model.rotation.x += 0.01;
      this.model.rotation.y += 0.01;
    }
  }
}
