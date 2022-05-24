import * as THREE from '../libraries/three.module.js';
import { scene } from "../../main.js";
import { fortunes } from "./fortunes.js"
import { completeEdge, edge } from './beachLine.js';
let planeWidth, planeHeight, maxY, maxX;
planeWidth = 1000;
planeHeight = 1000;
maxY = planeHeight / 2;
maxX = planeWidth / 2;
class area {
    constructor(upperC, upperM, lowerC, lowerM) {
        this.upperC = upperC;
        this.upperM = upperM;
        this.lowerC = lowerC;
        this.lowerM = lowerM;
    }

    isInBound(point) {
        var currX = point.x;
        var upperY = this.upperM * currX + this.upperC;
        var lowerY = this.lowerM * currX + this.lowerC;
        return (point.y < upperY && point.y > lowerY)
    }
}

function createPlane() {
    var material = new THREE.MeshStandardMaterial({ color: 'black' });
    var geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    var plane = new THREE.Mesh(geometry, material);
    plane.rotateX(THREE.MathUtils.degToRad(270));
    scene.add(plane);
}

function start() {
    var word = document.getElementById("input").value;
    var numPoints = 10;
    var numBuildings = 6000;
    var points = [];
    createPlane();
    if (word.length > 1) {
        var randSeed = sortWord(word);
        for (var i = 0; i < numPoints; i++) {
            var sum = 0;
            var subTot = 0;
            for (var j = 0; j < randSeed[i % 3].length; j++) {
                sum = sum + randSeed[i % 3][j] + i + j;
                subTot = subTot - randSeed[i % 3][j] - i - j;
            }
            points.push(new THREE.Vector2(subTot, Math.random() * sum));
        }
        //console.log(points);
        var edges = fortunes(points);
        //console.log(edges);
        var refinedEdges = [];
        for (var i = 0; i < edges.length; i++) {
            //line(edges[i].endpointA, edges[i].endpointB);
            var newEdge = generalLine(edges[i].endpointA, edges[i].endpointB, maxX);
            if (newEdge != false) {
                refinedEdges.push(newEdge);
            }
        }
        //console.log(refinedEdges);
        var roads = [];
        for (var i = 0; i < refinedEdges.length; i++) {
            var up = bumpUp(refinedEdges[i].endpointA, refinedEdges[i].endpointB, refinedEdges[i].endpointA.x);
            var down = bumpDown(refinedEdges[i].endpointA, refinedEdges[i].endpointB, refinedEdges[i].endpointA.x);
            if (!(Number.isNaN(up[1])) ||
                !(Number.isNaN(up[0])) ||
                !(Number.isNaN(down[1])) ||
                !(Number.isNaN(down[0])))
                var newArea = new area(up[1], up[0], down[1], down[0]); //For each edge we get an area class
            roads.push(newArea);
        }
        console.log(roads);
        //console.log(refinedEdges);
        var currentWidth = -planeWidth / 2;
        var currBuildings = 0;
        var inc = 13;
        for (var i = 5; i < planeWidth; i += inc) {
            var currentHeight = -planeHeight / 2;
            for (var j = 5; j < planeHeight; j += inc) {
                var placementPoint = new THREE.Vector2(currentWidth, currentHeight)
                var isInRoad = false;
                for (var k = 0; k < roads.length; k++) {
                    isInRoad = roads[k].isInBound(placementPoint);
                    if (isInRoad) {//if true stop for loop
                        break;
                    }
                }
                if (!isInRoad) {
                    createBuilding(placementPoint);
                    //console.log(currBuildings)
                    currBuildings++;
                }
                currentHeight += inc;
                if (currBuildings > numBuildings) {
                    break;
                }
            }
            currentWidth += inc;
        }
    }
}

function bumpUp(pointA, pointB) { //moves line up
    var m = (pointA.y - pointB.y) / (pointA.x - pointB.x);
    if (m == -Infinity || m == Infinity) {
        console.log('straightLine TO DO');
    }
    var c = pointA.y - (m * pointA.x);
    var mc = [m, c + 15];//random bump number of 10
    return mc;
}

function bumpDown(pointA, pointB) {//moves line down
    var m = (pointA.y - pointB.y) / (pointA.x - pointB.x);
    if (m == -Infinity || m == Infinity) {
        console.log('straightLine');
    }
    var c = pointA.y - (m * pointA.x);
    var mc = [m, c - 15];
    return mc;
}
function sortWord(word) {
    var seperate = []
    var one = [];
    var two = [];
    var three = [];
    seperate.push(one);
    seperate.push(two);
    seperate.push(three);
    for (var i = 0; i < word.length; i++) {
        seperate[i % 3].push(word.charCodeAt(i))
    }
    //console.log(seperate);
    return seperate;
}

function line(pointA, pointB) {
    const points = [];
    points.push(new THREE.Vector3(pointA.x, 0, pointA.y));
    points.push(new THREE.Vector3(pointB.x, 0, pointB.y));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 'black' });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
}
function genFormX(pointA, pointB, x) {
    //console.log("recieved A, B", pointA, pointB);

    var m = (pointA.y - pointB.y) / (pointA.x - pointB.x);
    if (m == -Infinity || m == Infinity) {
        console.log('straightLine');
    }
    var c = pointA.y - (m * pointA.x);
    return m * x + c
}

function genFormY(pointA, pointB, y) {
    //console.log("recieved A, B", pointA, pointB);
    var m = (pointA.y - pointB.y) / (pointA.x - pointB.x);
    if (m == -Infinity || m == Infinity) {
        console.log('straightLine');
    }
    var c = pointA.y - (m * pointA.x);
    return (y - c) / m
}

function generalLine(pointA, pointB, max) {
    if (Number.isNaN(pointA.x) ||
        Number.isNaN(pointA.y) ||
        Number.isNaN(pointB.x) ||
        Number.isNaN(pointB.y)) {
        return false;
    }

    if (pointA.x != pointB.x || pointA.y != pointB.y) {
        //Both points dont exist on defined square plane
        if (!existsOnPlane(pointA, max) && !(existsOnPlane(pointB, max))) {
            //console.log("BOTH PPOINTS NOT IN ")
            var newPoints = intersectsMax(pointA, pointB, max);
            if (newPoints == false) {
                return false;
            }
            //console.log("new pOints", newPoints);
            pointA = newPoints[0];
            pointB = newPoints[1];
            var refinedEdge = new completeEdge(pointA, pointB);
            // point(pointA);
            // point(pointB);
            return refinedEdge;
        }
        if (doesLineIntersect(pointA, pointB, max)) { //Line starts from zone but leaves
            // console.log(pointA, pointB);
            var location = whereIntersect(pointA, pointB, max);
            switch (location) {
                case "left":
                    if (pointA.x < -max) {
                        pointA.y = genFormX(pointA, pointB, -max);
                        pointA.x = -max;
                    }
                    if (pointB.x < -max) {
                        pointB.y = genFormX(pointA, pointB, -max);
                        pointB.x = -max;
                    }
                    break;
                case "right":
                    if (pointA.x > max) {
                        pointA.y = genFormX(pointA, pointB, max);
                        pointA.x = max;
                    }
                    if (pointB.x > max) {
                        pointB.y = genFormX(pointA, pointB, max);
                        pointB.x = max;
                    }
                    break;
                case "top":
                    if (pointA.y > max) {
                        pointA.x = genFormY(pointA, pointB, max);
                        pointA.y = max;
                    }
                    if (pointB.y > max) {
                        pointB.x = genFormY(pointA, pointB, max);
                        pointB.y = max;
                    }
                    break;
                case "bot":
                    if (pointA.y < -max) {
                        pointA.x = genFormY(pointA, pointB, -max);
                        pointA.y = -max;
                    }
                    if (pointB.y < -max) {
                        pointB.x = genFormY(pointA, pointB, -max);
                        pointB.y = -max;
                    }
                    break;
                default:
                    console.log("defaulted");
            }
            // console.log(location);
        }
    }
    // point(pointA);
    // point(pointB);
    // console.log(pointA, pointB);
    var refinedEdge = new completeEdge(pointA, pointB);
    return refinedEdge;
}
function existsOnPlane(point, max) {
    return (point.x <= max && point.x >= -max) && (point.y <= max && point.y >= -max)
}
function doesLineIntersect(pointA, pointB, max) {
    //LEFT SIDE OF SQUARE C,D
    //BOT SIDE OF SQUARE D,E
    //TOP SIDE OF SQUARE C,F
    //RIGHT SIDE OF SQUARE F,E
    var a = pointA;
    var b = pointB;
    var c = new THREE.Vector2(-max, max);
    var d = new THREE.Vector2(-max, -max);
    var e = new THREE.Vector2(max, -max);
    var f = new THREE.Vector2(max, max);
    //(B-A) * (C-A)
    var val = [];
    val.push(isIntersectLine(a, b, c, d));
    val.push(isIntersectLine(a, b, c, f));
    val.push(isIntersectLine(a, b, f, e));
    val.push(isIntersectLine(a, b, d, e));
    for (var i = 0; i < val.length; i++) {
        if (val[i]) {
            return true;
        }
    }
}

function whereIntersect(pointA, pointB, max) {
    //LEFT SIDE OF SQUARE C,D
    //BOT SIDE OF SQUARE D,E
    //TOP SIDE OF SQUARE C,F
    //RIGHT SIDE OF SQUARE F,E
    var a = pointA;
    var b = pointB;
    var c = new THREE.Vector2(-max, max);
    var d = new THREE.Vector2(-max, -max);
    var e = new THREE.Vector2(max, -max);
    var f = new THREE.Vector2(max, max);
    //(B-A) * (C-A)
    var left = isIntersectLine(a, b, c, d);
    var top = isIntersectLine(a, b, c, f);
    var right = isIntersectLine(a, b, f, e);
    var bot = isIntersectLine(a, b, d, e);
    if (left) {
        var str = "left";
        return str;
    }
    if (top) {
        var str = "top"
        return str;
    }
    if (right) {
        var str = "right"
        return str;
    }
    if (bot) {
        var str = "bot"
        return str;
    }
    return;
}
function isIntersectLine(a, b, c, d) {
    var abcd = crossProd(a, b, c) * crossProd(a, b, d);
    var cdab = crossProd(c, d, a) * crossProd(c, d, b);
    return abcd < 0 && cdab < 0
}
function crossProd(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
function intersectsMax(pointA, pointB, max) {
    var results = [];
    var filtered = [];
    //console.log(pointA, pointB)
    if (doesLineIntersect(pointA, pointB, max)) {
        results.push(new THREE.Vector2(max, genFormX(pointA, pointB, max)));
        results.push(new THREE.Vector2(-max, genFormX(pointA, pointB, -max)));
        results.push(new THREE.Vector2(genFormY(pointA, pointB, max), max));
        results.push(new THREE.Vector2(genFormY(pointA, pointB, -max), -max));
        for (var i = 0; i < results.length; i++) {
            if (existsOnPlane(results[i], max)) {
                filtered.push(results[i]);
            }
        }
    }
    //console.log(filtered);
    if (filtered.length == 0) {
        return false;
    }
    return filtered;
}
//Test function
function point(point) {
    //console.log("point", point)
    const geometry = new THREE.SphereGeometry(5, 5, 5);
    const material = new THREE.MeshStandardMaterial({ color: 'purple' });
    const dot = new THREE.Mesh(geometry, material);
    dot.translateX(point.x);
    dot.translateZ(point.y);

    scene.add(dot);
}

function createBuilding(point) {
    let base = 10;
    let width = 10;
    let height = Math.random() * 100;
    const geometry = new THREE.BoxGeometry(base, height, width);
    const material = new THREE.MeshPhongMaterial({ color: 'grey' });
    material.shininess = 100;
    const cube = new THREE.Mesh(geometry, material);
    cube.translateX(point.x);
    cube.translateZ(point.y);
    cube.translateY(height / 2);
    scene.add(cube);
}

export { start };