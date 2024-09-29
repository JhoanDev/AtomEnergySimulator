import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const speed = 0.1;
let theta = 0.1;

export default class Atom {
  constructor(scene, type) {
    this.model = null;
    this.scene = scene;
    this.type = type;
    this.load(this);
  }

  move(direction, value) {
    theta += speed;

    if (direction == "x" && this.model) {
      this.model.position.x = Math.sin(theta) * speed + value;
    } else if (direction == "y" && this.model) {
      this.model.position.y = Math.sin(theta) * speed + value;
    } else if (direction == "z" && this.model) {
      this.model.position.z = Math.sin(theta) * speed + value;
    }
  }

  load(object) {
    const loader = new GLTFLoader();
    loader.load(`src/models/${this.type}.gltf`, (gltf) => {
      this.scene.add(gltf.scene);

      object.model = gltf.scene.children[0];

      gltf.animations;
      gltf.scene;
      gltf.scenes;
      gltf.cameras;
      gltf.asset;
    });
  }

  rotate() {
    if (this.model) {
      this.model.rotation.x += 0.01;
      this.model.rotation.y += 0.01;
    }
  }
}
