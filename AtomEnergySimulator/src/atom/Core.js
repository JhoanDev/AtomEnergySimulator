import * as THREE from "three";
import AtomStructure from "./AtomStructure";

export default class Core {
  constructor(scene, numberOfProtons, numberOfNeutrons, atomRadius = 0.35) {
    this.atoms = []; // Lista de partículas do núcleo
    this.scene = scene;  // Cena principal
    this.numberOfNeutrons = numberOfNeutrons;
    this.numberOfProtons = numberOfProtons;
    this.atomRadius = atomRadius; // Raio do átomo
    this.coreRadius = this.calculateCoreRadius(); // Raio do núcleo
    this.minDistance = atomRadius * 2 + 0.01; // Distância mínima entre os átomos 
    this.allAtomsIsFixed = false; // Se todas as partículas estão fixas
    this.addParticles(); // Adiciona as partículas ao núcleo
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

    const nucleusRadius = this.atomRadius * 
    Math.pow((this.numberOfNeutrons + this.numberOfProtons) / packingFactor, 1 / 3);

    return nucleusRadius;
  }

  // Função para gerar uma posição aleatória dentro de uma esfera
  generateRandomPosition() {
    let x, y, z;
    do {
      x = (Math.random() - 0.5) * 2 * this.coreRadius;
      y = (Math.random() - 0.5) * 2 * this.coreRadius; 
      z = (Math.random() - 0.5) * 2 * this.coreRadius;
    } while (Math.sqrt(x * x + y * y + z * z) > this.coreRadius); // Garante que o ponto está dentro do núcleo
    return new THREE.Vector3(x, y, z); // Retorna a posição
  }

  // Função para checar se uma posição está longe o suficiente das outras
  isPositionValid(position) {
    // Verifica se a posição está colidindo com algum átomo
    for (const atom of this.atoms) { // Itera sobre todos os átomos
      const distance = atom.position.distanceTo(position); // Usar a posição armazenada
      if (distance < this.minDistance) { // Verifica se a distância é menor que o mínimo
        return false; // Posição inválida
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
        this.allAtomsIsFixed = false; // Se qualquer átomo não estiver fixo, a flag é falsa
        return;
      }
    }
    this.allAtomsIsFixed = true; // Se todos os átomos estiverem fixos, a flag é verdadeira
  }
}