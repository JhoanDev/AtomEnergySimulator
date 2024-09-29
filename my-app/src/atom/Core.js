import * as THREE from "three";
import AtomStructure from "./AtomStructure";

export default class Core {
  constructor(scene, numberOfProtons, numberOfNeutrons, atomRadius = 0.35) {
    this.atoms = [];
    this.scene = scene;
    this.numberOfNeutrons = numberOfNeutrons;
    this.numberOfProtons = numberOfProtons;
    this.atomRadius = atomRadius;
    this.coreRadius = this.calculateCoreRadius();
    this.minDistance = atomRadius * 2; // Distância mínima entre os átomos
    this.allAtomsIsFixed = false;
    this.addParticles();
  }

  calculateCoreRadius() {
    const packingFactor = 0.74; // Fator de empacotamento
    // Cálculo do raio do núcleo usando a fórmula:
    // r = r_atom * (N / packingFactor)^(1/3)
    // Onde:
    // - r é o raio do núcleo
    // - r_atom é o raio de um único átomo
    // - N é o número total de partículas (nêutrons + prótons)
    // - packingFactor é a densidade de empacotamento
    // Essa fórmula é derivada da teoria de empacotamento de esferas em três dimensões,
    // onde o volume ocupado por partículas em uma estrutura compacta é considerado.

    const nucleusRadius =
      this.atomRadius *
      Math.pow(
        (this.numberOfNeutrons + this.numberOfProtons) / packingFactor,
        1 / 3
      );

    return nucleusRadius;
  }

  // Função para gerar uma posição aleatória dentro de uma esfera
  generateRandomPosition() {
    let x, y, z;
    do {
      x = (Math.random() - 0.5) * 2 * this.coreRadius;
      y = (Math.random() - 0.5) * 2 * this.coreRadius;
      z = (Math.random() - 0.5) * 2 * this.coreRadius;
    } while (Math.sqrt(x * x + y * y + z * z) > this.coreRadius); // Garante que o ponto está dentro da esfera
    return new THREE.Vector3(x, y, z);
  }

  // Função para checar se uma posição está longe o suficiente das outras
  isPositionValid(position) {
    // Verifica se a posição está colidindo com algum átomo
    for (const atom of this.atoms) {
      const distance = atom.position.distanceTo(position); // Usar a posição armazenada
      if (distance < this.minDistance) {
        return false;
      }
    }
    return true; // Posição válida
  }

  addParticles() {
    let i;
    let position;

    // Adicionando neutrons
    for (i = 0; i < this.numberOfNeutrons; i++) {
      do {
        position = this.generateRandomPosition();
      } while (!this.isPositionValid(position)); // Gera uma nova posição até encontrar uma válida
      if (i === 0) {
        position = new THREE.Vector3(0, 0, 0); // Primeiro nêutron no centro
      }
      const neutron = new AtomStructure(this.scene, "neutron", this);
      if (i === 0) {
        neutron.fixed = true; // Fixa o primeiro nêutron
      }
      neutron.setPosition(position); // Definir a posição do átomo
      this.atoms.push(neutron);
    }

    // Adicionando protons
    for (i = 0; i < this.numberOfProtons; i++) {
      do {
        position = this.generateRandomPosition();
      } while (!this.isPositionValid(position)); // Gera uma nova posição até encontrar uma válida

      const proton = new AtomStructure(this.scene, "proton", this);
      proton.setPosition(position); // Definir a posição do átomo
      this.atoms.push(proton);
    }
  }

  allAtomsFixed() {
    for (const atom of this.atoms) {
      if (!atom.fixed) {
        this.allAtomsIsFixed = false;
        return;
      }
    }
    this.allAtomsIsFixed = true;
  }
}
