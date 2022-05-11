import { scene } from "../../main.js";
import { FontLoader } from "../libraries/FontLoader.js";
import { TextGeometry } from "../libraries/TextGeometry.js";
import * as THREE from "../libraries/three.module.js";
let defaultFont, words;

function initWords() {
  var input = document.getElementById("input");
  input.addEventListener("keyup", updateWords);
  input.value = "Type Here!";
  addText(getTextGeo(input.value));
}

export function loadFont() {
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
  return textGeo;
}

function addText(textGeometry) {
  //Text material can probably be another input
  var textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  words = new THREE.Mesh(textGeometry, textMaterial);

  textGeometry.computeBoundingBox();
  const centerOffSet =
    -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);

  words.position.x = centerOffSet;
  words.position.y = 30;
  words.position.z = 0;
  words.rotation.x = 0;
  words.rotation.y = Math.PI * 2;
  words.name = "words"; //Need this to reference it in the scene
  scene.add(words);
}

//Event function
function updateWords() {
  scene.remove(scene.getObjectByName(words.name));
  addText(getTextGeo(document.getElementById("input").value));
}
