import * as THREE from "three";
import Electron from "./Electron";
import { cos } from "three/webgpu";

export default class ValenceShell {
  constructor(scene, layer, normalVector, quantidadeEletrons) {
    this.scene = scene; // Cena principal
    this.layer = layer; // Identifica a camada (1 - K, 2 - L, etc.)
    this.quantidadeEletrons = quantidadeEletrons; // Quantidade de elétrons na camada
    this.planeNormal = new THREE.Vector3(
      normalVector.x,
      normalVector.y,
      normalVector.z
    ); // Vetor normal fornecido
    this.planeNormal.normalize(); // Transforma o vetor normal passado em unitário

    // inicialiazando os Vetores ortogonais para calcular eles abaixo
    this.orthogonalVector1 = new THREE.Vector3();
    this.orthogonalVector2 = new THREE.Vector3();

    // Calcula os vetores ortogonais
    this.calculateOrthogonalVectors();
    this.radius = 2 + (this.layer - 1) * 1.2; // Define o raio do anel com base na camada de valência
    this.ring; // Anel da camada

    console.log(`Normal do plano: ${this.planeNormal.x}, ${this.planeNormal.y}, ${this.planeNormal.z}`);
    console.log(`Vetor ortogonal 1: ${this.orthogonalVector1.x}, ${this.orthogonalVector1.y}, ${this.orthogonalVector1.z}`);
    console.log(`Vetor ortogonal 2: ${this.orthogonalVector2.x}, ${this.orthogonalVector2.y}, ${this.orthogonalVector2.z}`);
    this.addToScene(); // Adiciona o anel à cena
    this.eletrons = [];
    this.addElectrons(); // Adiciona os elétrons à camada
  }

  // Método para calcular os vetores ortogonais
  calculateOrthogonalVectors() {
    // Vetor arbitrário para o produto vetorial
    let arbitraryVector = new THREE.Vector3(1, 0, 0);

    // Se o vetor normal estiver mais próximo do eixo X, usamos o eixo Y como vetor arbitrário
    // evitando que o produto vetorial seja zero e o plano não seja definido
    if (Math.abs(this.planeNormal.x) > 0.5) {
      arbitraryVector.set(0, 1, 0);
    }

    // Primeiro vetor ortogonal: produto vetorial entre o vetor normal e o vetor arbitrário
    this.orthogonalVector1
      .crossVectors(this.planeNormal, arbitraryVector)
      .normalize();

    // crossVectors é uma função que calcula o produto vetorial entre dois vetores
    // normalize é uma função que transforma o vetor resultante em um vetor unitário

    // Segundo vetor ortogonal: produto vetorial entre o vetor normal e o primeiro vetor ortogonal
    this.orthogonalVector2
      .crossVectors(this.planeNormal, this.orthogonalVector1)
      .normalize();

    // assim os 3 vetores são ortogonais entre si
  }

  // Método para adicionar o plano à cena
  addToScene() {
    const tubeRadius = 0.07; // Raio da "espessura" da anel
    const radialSegments = 30; // Segmentos ao redor do raio maior
    const tubularSegments = 16; // Segmentos ao longo da espessura do tubo

    // TorusGeometry cria uma geometria em formato de anel
    const geometry = new THREE.TorusGeometry(
      this.radius,
      tubeRadius,
      tubularSegments,
      radialSegments
    );
    const material = new THREE.MeshBasicMaterial({
      color: 0x22ff99,
      side: THREE.DoubleSide,
    }); // Material do anel

    this.ring = new THREE.Mesh(geometry, material); // Cria o mesh do anel

    // O plano deve ser definido pelos vetores ortogonais, então usaremos esses vetores para orientar o plano
    this.ring.lookAt(this.planeNormal); // A face será perpendicular ao vetor normal

    // Rotaciona o plano para alinhar com os vetores ortogonais
    this.ring.rotateOnAxis(this.orthogonalVector1, Math.PI / 2); //rotação ao longo do primeiro vetor ortogonal
    this.ring.rotateOnAxis(this.orthogonalVector2, Math.PI / 2); //rotação ao longo do segundo vetor ortogonal

    this.scene.add(this.ring);
  }

  addElectrons() {
    console.log(`Adicionando elétrons na camada ${this.layer}`);
    console.log('ring position', this.ring.position);

    for (let i = 0; i < this.quantidadeEletrons; i++) {
      console.log(`Adicionando elétron ${i + 1}`);
      const angle = (i * Math.PI * 2) / this.quantidadeEletrons;
      const electron = new Electron(this.scene, this);
      electron.angle = angle; // Armazena o ângulo
      this.eletrons.push(electron);

      const a = this.radius * Math.cos(angle);
      const b = this.radius * Math.sin(angle);

      // Clone os vetores antes de multiplicá-los
      let vetor = new THREE.Vector3(0, 0, 0);
      vetor = this.orthogonalVector1.clone().multiplyScalar(a).add(this.orthogonalVector2.clone().multiplyScalar(b));

      // Adiciona a posição do anel
      vetor.add(this.ring.position); // Posiciona em relação ao centro do anel  

      // Rotaciona o vetor ao longo dos vetores ortogonais
      vetor.applyAxisAngle(this.orthogonalVector1, Math.PI / 2); // rotação ao longo do primeiro vetor ortogonal
      vetor.applyAxisAngle(this.orthogonalVector2, Math.PI / 2); // rotação ao longo do segundo vetor ortogonal

      electron.setPosition(vetor);
    }
  }



}