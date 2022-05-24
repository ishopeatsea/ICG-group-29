import * as THREE from "./js/libraries/three.module.js";
import { OrbitControls } from "./js/libraries/OrbitControls.js";
<<<<<<< HEAD
import { loadFont, createPointLight } from "./js/modules/base.js";
import { start } from "./js/modules/buildingMaker.js";
import { shaderMaterial } from './js/modules/flowFieldShader.js';

let camera, renderer, controls, ratio, scene;
=======
import { loadFont } from "./js/modules/base.js";
import { shaderMaterial } from './js/modules/flowFieldShader.js';

export let scene;
let camera, renderer, controls, ratio;
>>>>>>> bf1bc650d7ccdc8b99742bee30c2c8093c994794
let time = Date.now();

loadFont();
init();
start();

function init() {
  ratio = window.innerWidth / window.innerHeight;

  //Camera init
  camera = new THREE.PerspectiveCamera(60, ratio, 0.1, 10000);
  camera.position.set(0, 100, 800);
  camera.lookAt(0, 0, 1);

  //Renderer init
<<<<<<< HEAD
  //var cameralight = new THREE.PointLight( new THREE.Color(1,1,1), 0.5 );
  //camera.add(new THREE.PointLight( new THREE.Color(1,1,1), 0.5 ));
=======
  var cameralight = new THREE.PointLight( new THREE.Color(1,1,1), 0.5 );
  camera.add(cameralight);
>>>>>>> bf1bc650d7ccdc8b99742bee30c2c8093c994794

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
<<<<<<< HEAD
  scene.background = new THREE.Color('black');
=======
>>>>>>> bf1bc650d7ccdc8b99742bee30c2c8093c994794
  scene.add(camera);

  controls = new OrbitControls(camera, renderer.domElement);
  console.log("Scene children", scene.children);
}

requestAnimationFrame(MyUpdateLoop); //Enters update loop
function MyUpdateLoop() {
  renderer.render(scene, camera);
<<<<<<< HEAD
  scene.remove(scene.getObjectByName("pointLight"));
  scene.add(createPointLight(camera.position));
=======
>>>>>>> bf1bc650d7ccdc8b99742bee30c2c8093c994794
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

export { camera, scene };