import * as THREE from "../libraries/three.module.js";
import { OrbitControls } from "../libraries/OrbitControls.js";
import { TextGeometry } from "../libraries/TextGeometry.js";
import { FontLoader } from "../libraries/FontLoader.js";
import { scene, camera, renderer } from "../../main.js";

var controls, options, gui, loader;
var enabled = false;
var raycaster;
var mouseClickPos = new THREE.Vector2();
var vec = new THREE.Vector3();
var pos = new THREE.Vector3();
var world,
  timestep,
  spherePhysMat,
  groundPhysMat,
  groundContactPhysMat,
  ballContactPhysMat;

function toggleGravityModule() {
  if (enabled) {
    //initSceneSetup();
    scene.clear();
    initGUI();
    raycaster = new THREE.Raycaster();
    initLighting();
    initGravitySetup();
    initMeshes();
    generateLetterSpheres(450);
    requestAnimationFrame(MyUpdateLoop);
  }
  enabled = !enabled;
}

//Initiliase Scene

function initSceneSetup() {
  const ratio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(60, ratio, 0.1, 100000);
  camera.position.set(-3120, 3517, 3112);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#87CEEB");
  controls = new OrbitControls(camera, renderer.domElement);
}

function initGUI() {
  options = {
    restitution: 0.5,
    friction: 0.5,
    gravity: -500,
    gen_Spheres: function () {
      generateLetterSpheres(30);
    },
  };
  gui = new dat.GUI();
  gui.add(options, "restitution", 0, 0.8).name("Ball Bounciness").listen();
  gui.add(options, "gravity", -1000, 1000).name("Gravity").listen();
  gui.add(options, "friction", 0, 1).name("Friction").listen();
  gui.add(options, "gen_Spheres").name("Add More Spheres");
}

function initLighting() {
  const ambLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.55);
  dirLight.castShadow = true;
  dirLight.position.set(0, 3000, 0);
  dirLight.shadow.camera.left = 1500;
  dirLight.shadow.camera.right = -1500;
  dirLight.shadow.camera.top = 3000;
  dirLight.shadow.camera.bottom = -1500;
  dirLight.shadow.camera.far = 3000;
  dirLight.shadow.camera.near = 0.1;

  //const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 1000);
  //const shadowCameraHelper = new THREE.CameraHelper(dirLight.shadow.camera);
  //scene.add(shadowCameraHelper);
  //scene.add(dirLightHelper);
  scene.add(dirLight);
}

function initGravitySetup() {
  //Setup Physics World
  world = new CANNON.World();
  world.gravity.set(0, options.gravity, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  timestep = 1 / 60;

  //Setup Physics Materials
  spherePhysMat = new CANNON.Material();
  groundPhysMat = new CANNON.Material();
  groundContactPhysMat = new CANNON.ContactMaterial(
    groundPhysMat,
    spherePhysMat,
    {
      restitution: options.restitution,
      friction: options.friction,
    }
  );
  ballContactPhysMat = new CANNON.ContactMaterial(
    spherePhysMat,
    spherePhysMat,
    {
      restitution: options.restitution * 1.7,
    }
  );
  world.addContactMaterial(groundContactPhysMat);
  world.addContactMaterial(ballContactPhysMat);
}

//Update Loop
function MyUpdateLoop() {
  gravityUpdate();
  requestAnimationFrame(MyUpdateLoop);
}

function gravityUpdate() {
  world.step(timestep);
  for (var i = 0; i < sphereMeshs.length; i++) {
    sphereMeshs[i].position.copy(sphereBodys[i].position);
    sphereMeshs[i].quaternion.copy(sphereBodys[i].quaternion);
  }
  if (groundContactPhysMat.restitution != options.restitution) {
    groundContactPhysMat.restitution = options.restitution;
  }
  if (groundContactPhysMat.friction != options.friction) {
    groundContactPhysMat.friction = options.friction;
  }
  if (world.gravity != options.gravity.y) {
    world.gravity.set(0, options.gravity, 0);
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

var selectedObjected;
window.addEventListener("click", (event) => {
  if (selectedObjected !== null) {
    selectedObjected = null;
    return;
  }

  mouseClickPos.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouseClickPos.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouseClickPos, camera);
  const intersections = raycaster.intersectObjects(scene.children);
  intersections.forEach((intersection) => {
    if (intersection.object.userData.selectable) {
      selectedObjected = sphereBodys[intersection.object.userData.arrayIndex];
    }
  });
});

window.addEventListener("mousemove", (event) => {
  if (selectedObjected !== null && selectedObjected !== undefined) {
    vec.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      100
    );
    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    var distance = -camera.position.z / vec.z;
    pos.copy(camera.position).add(vec.multiplyScalar(distance));
    selectedObjected.position.x = pos.x;
    selectedObjected.position.y = pos.y;
    selectedObjected.position.z = pos.z;
  }
});

//Window Resizing
window.addEventListener("resize", MyResize);
function MyResize() {
  var width = window.innerWidth;
  var height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

//Keyboard Presses
window.addEventListener("keydown", keyDown);
function keyDown(event) {
  switch (event.keyCode) {
    case 13:
      var letters = Array.from(document.getElementById("input").value);
      for (var i = 0; i < letters.length; i++) {
        generateLetterMesh(letters[i]);
        generateSphereBody(i);
      }
      break;
    case 32:
      world.gravity.set(0, 3500, 0);
      break;
    case 37:
      world.gravity.set(-1500, options.gravity, 0);
      break;
    case 38:
      world.gravity.set(0, options.gravity, -1500);
      break;
    case 39:
      world.gravity.set(1500, options.gravity, 0);
      break;
    case 40:
      world.gravity.set(0, options.gravity, 1500);
      break;
  }
}

var sphereMeshs = [];
var sphereBodys = [];
var pastelColours = [
  "#F9CEEE",
  "#CCF3EE",
  "#99FEFF",
  "#CAB8FF",
  "#FCFFA6",
  "#CDF2CA",
  "#ff6961",
];

function generateLetterMesh(letter) {
  loader = new FontLoader();
  loader.load("fonts/helvetiker_regular.typeface.json", function (font) {
    const geometry = new TextGeometry(letter.toUpperCase(), {
      font: font,
      size: 55,
      height: 5,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 10,
      bevelSize: 8,
      bevelOffset: 0,
      bevelSegments: 5,
    });
    var textMaterial = new THREE.MeshPhongMaterial({
      color: pastelColours[getRandomInt(0, 7)],
    });
    letter = new THREE.Mesh(geometry, textMaterial);
    const sphereGeometry = new THREE.SphereGeometry(70);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: pastelColours[getRandomInt(0, 7)],
      transparent: true,
      opacity: 0.7,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.add(letter);
    letter.geometry.computeBoundingBox();
    var center = new THREE.Vector3();
    letter.geometry.boundingBox.getCenter(center);
    letter.geometry.translate(-center.x, -center.y, -center.z);
    sphereMeshs.push(sphere);
    scene.add(sphere);
  });
}

function generateEmptySpheres(num) {
  for (var i = 0; i <= num; i++) {
    const sphereSize = getRandomInt(40, 60);
    const sphereGeometry = new THREE.SphereGeometry(sphereSize);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: pastelColours[getRandomInt(0, 7)],
      transparent: true,
      opacity: 0.9,
      shininess: 40,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.userData.selectable = true;
    sphere.userData.arrayIndex = sphereMeshs.length;
    sphereMeshs.push(sphere);
    scene.add(sphere);
    var sphereBody;
    sphereBody = new CANNON.Body({
      mass: 1 * getRandomInt(5, 10),
      shape: new CANNON.Sphere(sphereSize),
      material: spherePhysMat,
      position: new CANNON.Vec3(
        getRandomInt(-1300, 1300),
        getRandomInt(200, 2500),
        getRandomInt(-1300, 1300)
      ),
    });
    sphereBody.linearDamping = 0.05 * getRandomInt(1, 19);
    sphereBodys.push(sphereBody);
    world.add(sphereBody);
  }
}

const alphabet = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

function generateLetterSpheres(num) {
  loader = new FontLoader();
  for (var i = 0; i < num; i++) {
    loader.load("fonts/helvetiker_regular.typeface.json", function (font) {
      const letterGeometry = new TextGeometry(alphabet[getRandomInt(0, 25)], {
        font: font,
        size: 50,
        height: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5,
      });
      var letterMaterial = new THREE.MeshPhongMaterial({
        color: pastelColours[getRandomInt(0, 7)],
      });
      var letter = new THREE.Mesh(letterGeometry, letterMaterial);

      const sphereSize = getRandomInt(50, 60);
      const sphereGeometry = new THREE.SphereGeometry(sphereSize);
      const sphereMaterial = new THREE.MeshPhongMaterial({
        color: pastelColours[getRandomInt(0, 7)],
        transparent: true,
        opacity: 0.75,
        shininess: 40,
      });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.castShadow = true;
      sphere.userData.selectable = true;
      sphere.userData.arrayIndex = sphereMeshs.length;
      letter.geometry.computeBoundingBox();
      var center = new THREE.Vector3();
      letter.geometry.boundingBox.getCenter(center);
      letter.geometry.translate(-center.x, -center.y, -center.z);
      sphere.add(letter);
      sphereMeshs.push(sphere);
      scene.add(sphere);
      var sphereBody;
      sphereBody = new CANNON.Body({
        mass: 1 * getRandomInt(5, 10),
        shape: new CANNON.Sphere(sphereSize),
        material: spherePhysMat,
        position: new CANNON.Vec3(
          getRandomInt(-1300, 1300),
          getRandomInt(200, 2500),
          getRandomInt(-1300, 1300)
        ),
      });
      sphereBody.linearDamping = 0.05 * getRandomInt(1, 19);
      sphereBodys.push(sphereBody);
      world.add(sphereBody);
    });
  }
}

function generateSphereBody(i) {
  var sphereBody;
  var position = new CANNON.Vec3(-600 + i * 140, 1650, -2600);
  if (i > 9) {
    position = new CANNON.Vec3(-600 + (i - 9) * 140, 1500, -2450);
  }
  if (i > 18) {
    position = new CANNON.Vec3(-600 + (i - 18) * 140, 1350, -2300);
  }
  sphereBody = new CANNON.Body({
    mass: 10 * getRandomInt(1, 10),
    shape: new CANNON.Sphere(70),
    material: spherePhysMat,
    position: position,
  });
  sphereBody.linearDamping = 0.05 * getRandomInt(1, 19);

  sphereBodys.push(sphereBody);
  world.add(sphereBody);
}

function initMeshes() {
  const floorGeometry = new THREE.BoxGeometry(3000, 3000, 30);
  const floorMaterial = new THREE.MeshLambertMaterial({
    color: pastelColours[getRandomInt(0, 6)],
    transparent: true,
    opacity: 0.18,
    side: 2,
  });
  var floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  var groundBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(3000 / 2, 3000 / 2, 30 / 2)),
    material: groundPhysMat,
    type: CANNON.Body.STATIC,
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  const wallGeometry1 = new THREE.BoxGeometry(3000, 400, 30);
  const wallGeometry2 = new THREE.BoxGeometry(30, 400, 3000);

  const wallMaterial1 = new THREE.MeshLambertMaterial({
    color: pastelColours[getRandomInt(0, 6)],
    transparent: true,
    opacity: 0.8,
  });

  const wallMaterial2 = new THREE.MeshLambertMaterial({
    color: pastelColours[getRandomInt(0, 6)],
    transparent: true,
    opacity: 0.8,
  });

  const wallMaterial3 = new THREE.MeshLambertMaterial({
    color: pastelColours[getRandomInt(0, 6)],
    transparent: true,
    opacity: 0.8,
  });

  const wallMaterial4 = new THREE.MeshLambertMaterial({
    color: pastelColours[getRandomInt(0, 6)],
    transparent: true,
    opacity: 0.8,
  });

  var wallMesh1 = new THREE.Mesh(wallGeometry1, wallMaterial1);
  var wallMesh2 = new THREE.Mesh(wallGeometry1, wallMaterial2);
  var wallMesh3 = new THREE.Mesh(wallGeometry2, wallMaterial3);
  var wallMesh4 = new THREE.Mesh(wallGeometry2, wallMaterial4);
  wallMesh1.receiveShadow = true;
  wallMesh2.receiveShadow = true;
  wallMesh3.receiveShadow = true;
  wallMesh4.receiveShadow = true;
  scene.add(wallMesh1);
  scene.add(wallMesh2);
  scene.add(wallMesh3);
  scene.add(wallMesh4);

  var wallBody1 = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(3000 / 2, 400 / 2, 30 / 2)),
    type: CANNON.Body.STATIC,
  });

  var wallBody2 = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(3000 / 2, 400 / 2, 30 / 2)),
    type: CANNON.Body.STATIC,
  });

  var wallBody3 = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(30 / 2, 400 / 2, 3000 / 2)),
    type: CANNON.Body.STATIC,
  });

  var wallBody4 = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(30 / 2, 400 / 2, 3000 / 2)),
    type: CANNON.Body.STATIC,
  });

  const rampGeometry = new THREE.BoxGeometry(2000, 1500, 40);
  const rampMaterial = new THREE.MeshLambertMaterial({
    color: pastelColours[getRandomInt(0, 6)],
    transparent: true,
    opacity: 0.7,
  });

  var rampMesh = new THREE.Mesh(rampGeometry, rampMaterial);
  rampMesh.receiveShadow = true;
  scene.add(rampMesh);

  var rampBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(2000 / 2, 1500 / 2, 40 / 2)),
    type: CANNON.Body.STATIC,
    material: groundPhysMat,
    position: new CANNON.Vec3(0, 800, -2150),
  });

  world.addBody(rampBody);
  rampMesh.rotateX(-60 * (Math.PI / 180));
  rampBody.quaternion.set(
    rampMesh.quaternion.x,
    rampMesh.quaternion.y,
    rampMesh.quaternion.z,
    rampMesh.quaternion.w
  );

  rampMesh.position.copy(rampBody.position);
  rampMesh.quaternion.copy(rampBody.quaternion);

  world.addBody(wallBody1);
  world.addBody(wallBody2);
  world.addBody(wallBody3);
  world.addBody(wallBody4);

  wallBody1.position.y += 400 / 2;
  wallBody1.position.z += 1500 + 15;

  wallBody2.position.y += 400 / 2;
  wallBody2.position.z -= 1500 + 15;

  wallBody3.position.y += 400 / 2;
  wallBody3.position.x += 1500 + 15;

  wallBody4.position.y += 400 / 2;
  wallBody4.position.x -= 1500 + 15;

  wallMesh1.position.copy(wallBody1.position);
  wallMesh2.position.copy(wallBody2.position);
  wallMesh3.position.copy(wallBody3.position);
  wallMesh4.position.copy(wallBody4.position);

  wallMesh1.quaternion.copy(wallBody1.quaternion);
  wallMesh2.quaternion.copy(wallBody2.quaternion);
  wallMesh3.quaternion.copy(wallBody3.quaternion);

  floorMesh.position.copy(groundBody.position);
  floorMesh.quaternion.copy(groundBody.quaternion);
}

export { toggleGravityModule };
