import * as THREE from './js/three.module.js';
import * as FONTLOADER from './js/FontLoader.js';
import * as TEXTGEOMETRY from './js/TextGeometry.js';
import * as ORBIT from './js/OrbitControls.js';

let ratio, camera, renderer, scene, controls, defaultFont;
let input, words;

loadFont();
init();

function init() {
  ratio = window.innerWidth / window.innerHeight;
  //Camera init
  camera = new THREE.PerspectiveCamera(60, ratio, 0.1, 1000);
  camera.position.set(0, 0, 800);
  camera.lookAt(0, 0, 1);
  //Renderer init
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  controls = new ORBIT.OrbitControls(camera, renderer.domElement);
}

//Inits words adds update event listener
function initWords() {
  input = document.getElementById('input');
  input.addEventListener('keyup', updateWords);
  input.value = 'Type Here!';
  addText(getTextGeo(input.value));
}

function loadFont() {
  const loader = new FONTLOADER.FontLoader();
  loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
    defaultFont = font;
    initWords();
    });
}

//Text geometry getter
function getTextGeo(myText){
  const textGeo = new TEXTGEOMETRY.TextGeometry(myText, {
  font: defaultFont,
  size: 70,
  height: 20,
  curveSegments: 4,
  bevelEnabled: true,
  bevelThickness: 2,
  bevelSize: 1.5,
  bevelOffset: 0,
  bevelSegments: 30
  });
  return textGeo;
}

function addText(textGeometry) {
  //Text material can probably be another input
  var textMaterial = new THREE.MeshBasicMaterial(
    { color: 0xffffff }
  )
  words = new THREE.Mesh(textGeometry, textMaterial);

  textGeometry.computeBoundingBox(); 
  const centerOffSet = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);

  words.position.x = centerOffSet;
  words.position.y = 30;
  words.position.z = 0;
  words.rotation.x = 0;
  words.rotation.y = Math.PI * 2;
  words.name = 'words'; //Need this to reference it in the scene
  scene.add(words);
}

requestAnimationFrame(MyUpdateLoop); //Enters update loop
function MyUpdateLoop() {
  renderer.render(scene, camera);
  controls.update();
  requestAnimationFrame(MyUpdateLoop);
};

//Event function
function MyResize() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
};
window.addEventListener('resize', MyResize);

//Event function
function updateWords() {
  scene.remove(scene.getObjectByName(words.name));
  addText(getTextGeo(document.getElementById('input').value));
}