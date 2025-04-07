import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class AtomStructure {
  constructor(scene, type, core, radius = 0.35) {
    this.scene = scene; //cena principal
    this.model = null;
    this.type = type; //tipo de partícula (próton, nêutron)
    this.core = core; //núcleo
    this.radius = radius; //raio da partícula
    this.fixed = false; //se a partícula está fixa ou não
    this.position = new THREE.Vector3(); // Posição 
    this.velocity = new THREE.Vector3(0, 0, 0); // Velocidade inicial
    this.load(this); // Carrega o modelo
  }

  // Método para carregar o modelo da partícula
  load(object) {
    const loader = new GLTFLoader();
    loader.load(import.meta.env.BASE_URL + `models/${this.type}.gltf`, (gltf) => {
      object.model = gltf.scene.children[0];
      object.model.scale.set(this.radius, this.radius, this.radius); // Escala
      object.model.position.copy(this.position); // Aplicar a posição após o carregamento
      this.scene.add(object.model); // Adiciona o modelo à cena
    });
  }

  // Método para definir a posição da partícula
  setPosition(position) {
    this.position.copy(position); // Armazena a posição
    if (this.model) {
      // Se o modelo já estiver carregado, aplicamos diretamente a posição
      this.model.position.copy(position);
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
      this.checkCollision(); // Verifica colisão
    }
  }

  // Método para verificar colisão
  checkCollision() {
    for (const atom of this.core.atoms) {
      if (atom !== this) { // Evita a comparação com a própria partícula
        const distance = this.position.distanceTo(atom.position); // Distância entre as partículas
        if (distance < this.core.minDistance) {
          this.fixed = true; // Fixa a partícula
          this.velocity.set(0, 0, 0); // Zera a velocidade
        }
      }
    }
  }

  // Método para rotacionar a partícula
  rotate() {
    if (this.model) {
      this.model.rotation.x += 0.01; // Rotação em x
      this.model.rotation.y += 0.01; // Rotação em y
    }
  }
}