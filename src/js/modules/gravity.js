import { scene } from "../../main.js";
import * as THREE from "../libraries/three.module.js";

let world, groundMesh, groundBody;
export function initGravity() {
  world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0),
  });

  const geometry = new THREE.PlaneGeometry(1500, 1500);
  geometry.rotateX(90 * (Math.PI / 180));
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
  });
  groundMesh = new THREE.Mesh(geometry, material);
  scene.add(groundMesh);

  groundBody = new CANNON.Body({
    shape: new CANNON.Plane(),
    mass: 100,
    //type: CANNON.Body.STATIC,
  });
  world.addBody(groundBody);
}

const timeStep = 1 / 60;
export function gravityAnimate() {
  world.step(timeStep);
  groundMesh.position.copy(groundBody.position);
  groundMesh.quaternion.copy(groundBody.quaternion);
}
