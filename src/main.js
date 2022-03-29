import * as THREE from "./js/libraries/three.module.js";
import { OrbitControls } from "./js/libraries/OrbitControls.js";
import { loadFont } from "./js/modules/base.js";

export let scene;
let camera, renderer, controls, ratio;

loadFont();
init();

function init() {
  ratio = window.innerWidth / window.innerHeight;
  //Camera init
  camera = new THREE.PerspectiveCamera(60, ratio, 0.1, 10000);
  camera.position.set(0, 0, 800);
  camera.lookAt(0, 0, 1);
  //Renderer init
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  controls = new OrbitControls(camera, renderer.domElement);
}

requestAnimationFrame(MyUpdateLoop); //Enters update loop
function MyUpdateLoop() {
  renderer.render(scene, camera);
  controls.update();
  requestAnimationFrame(MyUpdateLoop);
}

//Event function
function MyResize() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}
window.addEventListener("resize", MyResize);
