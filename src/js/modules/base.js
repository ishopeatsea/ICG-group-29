import { scene, camera } from "../../main.js";
import { FontLoader } from "../libraries/FontLoader.js";
import { TextGeometry } from "../libraries/TextGeometry.js";
import { start } from './buildingMaker.js';
import { shaderMaterial } from '../modules/flowFieldShader.js';
import * as THREE from "../libraries/three.module.js";

let defaultFont, words;

function initWords() {
  var input = document.getElementById("input");
  input.addEventListener("keyup", resetScene);
  input.value = "Type Here!";
  addText(getTextGeo(input.value));
}

function loadFont() {
  const loader = new FontLoader();
  loader.load("fonts/helvetiker_regular.typeface.json", function (font) {
    defaultFont = font;
    initWords();
  });
}

//Text geometry getter
function getTextGeo(myText) {
  const textGeo = new TextGeometry(myText, {
    font: defaultFont,
    size: 70,
    height: 20,
    curveSegments: 4,
    bevelEnabled: true,
    bevelThickness: 2,
    bevelSize: 1.5,
    bevelOffset: 0,
    bevelSegments: 30,
  });
  textGeo.castShadow = true;
  return textGeo;
}

function addText(textGeometry) {
  //Text material can probably be another input
  console.log(camera.position);

  scene.add(createPointLight(camera.position)); //Nathans pointlight
  //var textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  //words = new THREE.Mesh(textGeometry, textMaterial);
  //Shader material
  words = new THREE.Mesh(textGeometry, shaderMaterial);

  textGeometry.computeBoundingBox();
  const centerOffSet =
    -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);

  words.position.x = centerOffSet;
  words.position.y = 130;
  words.position.z = 0;
  words.rotation.x = 0;
  words.rotation.y = Math.PI * 2;
  words.name = "words"; //Need this to reference it in the scene
  scene.add(words);
}

function createAmLight() {
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.AmbientLight(color, intensity);
  return light
}

function createHemiLight() {
  const sky = 0XFFFFFF;
  const ground = 0X00b300;
  const intensity = 0.5;
  const light = new THREE.HemisphereLight(sky, ground, intensity);
  return light;
}

function createPointLight(point) {
  //const randColour = new Color(Math.random(), Math.random(), Math.random());
  const color = 0xFFFFFF;
  const light = new THREE.PointLight(color, 0.8, 5000);
  if (point != null) {
    light.position.set(point.x, point.y, point.z);
  }
  light.name = "pointLight";
  return light;
}
//Event function
// function updateWords() {
//   resetScene();
// }


function resetScene() {
  scene.clear();
  // console.log(camera.postion);
  if (scene.children.length == 0) {
    //if value is on buiild buildings or if gravity is on do that instead

    camera.add(createPointLight());
    addText(getTextGeo(document.getElementById("input").value));
    start();
    scene.add(createPointLight(camera.position))
  }
}

export { loadFont, createPointLight };