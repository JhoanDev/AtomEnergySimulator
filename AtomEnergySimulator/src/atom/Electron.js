import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class Electron {
  constructor(scene, valenceShell, radius = 0.35) {
    {
      this.scene = scene; //cena principal
      this.model = null;
      this.valenceShell = valenceShell; //camada de valência
      this.radius = radius; //raio da partícula
      this.position = new THREE.Vector3(); // Posição
      this.load(this); // Carrega o modelo
      this.angle = 0;
      this.raioDeOrbita = 0;
    }
  }

  // Método para carregar o modelo da partícula
  load(object) {
    const loader = new GLTFLoader();
    loader.load(`src/models/electron.gltf`, (gltf) => {
      object.model = gltf.scene.children[0];
      object.model.scale.set(this.radius, this.radius, this.radius); // Escala
      object.model.position.copy(this.position); // Aplicar a posição após o carregamento
      this.scene.add(object.model); // Adiciona o modelo à cena
    });
  }

  // Método para definir a posição da partícula
  setPosition(position) {
    this.position.copy(position);
    if (this.model) {
      this.model.position.copy(position);
    }
  }

  remove() {
    if (this.model) {
      this.scene.remove(this.model);
    }
  }

  rotate() {
    if (this.model) {
      this.model.rotation.x += 0.1; // Rotação em x
      this.model.rotation.y += 0.1; // Rotação em y
    }
  }
}
