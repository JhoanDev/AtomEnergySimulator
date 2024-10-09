import * as THREE from "three";
import Electron from "./Electron";

export default class ValenceShell {
  constructor(scene, layer, normalVector, electronsQuantity) {
    this.scene = scene; // Cena principal
    this.layer = layer; // Identifica a camada (1 - K, 2 - L, etc.)
    this.electronsQuantity = electronsQuantity; // Quantidade de elétrons na camada
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
    this.middleOfRing = new THREE.Vector3(0, 0, 0); // Posição do centro do anel

    //equação do plano
    this.A = 0;
    this.B = 0;
    this.C = 0;
    this.D = 0;
    this.calculateEquation();

    this.addToScene(); // Adiciona o anel à cena
    this.eletrons = [];
    this.addElectrons(); // Adiciona os elétrons à camada
  }

  calculateEquation() {
    // Coeficientes para os vetores ortogonais
    const a = 1;
    const b = 1;

    // Calcule um novo ponto no plano como combinação linear dos vetores ortogonais
    const ponto = this.orthogonalVector1
      .clone()
      .multiplyScalar(a)
      .add(this.orthogonalVector2.clone().multiplyScalar(b));

    // Obtenha a normal do plano
    this.A = this.planeNormal.x;
    this.B = this.planeNormal.y;
    this.C = this.planeNormal.z;

    // Calcule D usando o ponto que foi calculado
    this.D = -(this.A * ponto.x + this.B * ponto.y + this.C * ponto.z);
  }

  // Método para calcular os vetores ortogonais
  calculateOrthogonalVectors() {
    // Vetor arbitrário para o produto vetorial
    const arbitraryVector = new THREE.Vector3(1, 0, 0);

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
    const tubeRadius = 0.07; // Raio da "espessura" do anel
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
      side: THREE.DoubleSide, // Material que aparece dos dois lados do anel
    });

    this.ring = new THREE.Mesh(geometry, material); // Cria o mesh do anel

    // Equação do plano: Ax + By + Cz + D = 0

    // O método lookAt orienta a face do anel para ficar perpendicular ao vetor normal do plano
    this.ring.lookAt(this.planeNormal);

    // Calcular a distância do plano até a origem usando D, ajustando a posição do anel
    const distanceToOrigin = -this.D / this.planeNormal.length(); // D dividido pela magnitude do vetor normal
    this.ring.position.copy(
      this.planeNormal.normalize().multiplyScalar(distanceToOrigin)
    );

    // Adiciona o anel à cena
    this.scene.add(this.ring);
  }

  addElectrons() {
    for (let i = 0; i < this.electronsQuantity; i++) {
      const angle = (2 * Math.PI * i) / this.electronsQuantity; // Calcula o ângulo
      const electron = new Electron(this.scene, this);
      this.eletrons.push(electron);
      electron.angle = angle;
    }
  }

  rotateElectrons() {
    for (const electron of this.eletrons) {
      electron.angle += 0.03;
      const position = new THREE.Vector3(0, 0, 0); // Posição inicial
      electron.raioDeOrbita = 0.99*electron.raioDeOrbita + 0.01*this.radius;
      position.x =
        electron.raioDeOrbita * Math.cos(electron.angle) * this.orthogonalVector1.x +
        electron.raioDeOrbita * Math.sin(electron.angle) * this.orthogonalVector2.x;
      position.y =
        electron.raioDeOrbita * Math.cos(electron.angle) * this.orthogonalVector1.y +
        electron.raioDeOrbita * Math.sin(electron.angle) * this.orthogonalVector2.y;
      position.z =
        electron.raioDeOrbita * Math.cos(electron.angle) * this.orthogonalVector1.z +
        electron.raioDeOrbita * Math.sin(electron.angle) * this.orthogonalVector2.z;
      electron.setPosition(position);
    }
  }

  removeElectron() {
    for (const electron of this.eletrons) {
      electron.remove();
    }
  }

  removeValenceShell() {
    if (this.ring) {
      this.scene.remove(this.ring);
    }
  }
}
