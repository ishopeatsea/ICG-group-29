import * as THREE from "./js/libraries/three.module.js";
import { OrbitControls } from "./js/libraries/OrbitControls.js";
import { loadFont } from "./js/modules/base.js";
import { shaderMaterial } from './js/modules/flowFieldShader.js';

export let scene;
let camera, renderer, controls, ratio;
let time = Date.now();

loadFont();
init();

function init() {
  ratio = window.innerWidth / window.innerHeight;

  //Camera init
  camera = new THREE.PerspectiveCamera(60, ratio, 0.1, 10000);
  camera.position.set(0, 0, 800);
  camera.lookAt(0, 0, 1);

  //Renderer init
  var cameralight = new THREE.PointLight( new THREE.Color(1,1,1), 0.5 );
  camera.add(cameralight);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.add(camera);

  controls = new OrbitControls(camera, renderer.domElement);
}

requestAnimationFrame(MyUpdateLoop); //Enters update loop
function MyUpdateLoop() {
  renderer.render(scene, camera);
  shaderMaterial.uniforms.u_time.value += (time - Date.now()) * 0.001;
  controls.update();
  time = Date.now();
  requestAnimationFrame(MyUpdateLoop);
}

//Event function
function MyResize() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  renderer.setSize(width, height);
  shaderMaterial.uniforms.u_resolution.value.set(width / 4, height / 4);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}
window.addEventListener("resize", MyResize);
