import * as THREE from "../libraries/three.module.js";
import { prioQueue } from "./queue.js"
import { normalize, magnitude } from "./mathUtil.js"
class node {
    constructor() {
        this.left = null;
        this.right = null;
        this.parent = null;
    }
    setLeft(node) {
        if (node != null) {
            this.left = node;
            node.parent = this;
        }
    }
    setRight(node) {
        if (node != null) {
            this.right = node;
            node.parent = this;
        }
    }
    setParent(node) {
        if (node != null) {
            this.parent = node
        }
    }

    nodeCompare(obj){ //EDGES AND ARCS ONLY
        if(this.getType() == obj.getType()){
            if(obj.getType() == arc){
                return this.isEqualArc(obj);
            }
            if(obj.getType() == edge){
                return this.isEqualEdge(obj)
            }
        }
        return false;
    }

    //For when item is an item that exist inside the tree and node calling has no connection
    setParentFromItem(item) { //TO DO:
        if (item != null) {
            //Probably means this item is the root (or is disconnected from tree)
            if (item.parent == null) {
                this.parent = null;
                return;
            }
            if (item.parent.left.nodeCompare(item)) {
                item.parent.setLeft(this);
            } else if (item.parent.right.nodeCompare(item)) {
                item.parent.setRight(this);
            }
        }
    }

    getParentLeft() {
        if (this != null) {
            var current = this;
            while ((current.parent != null) && (current.parent.left.nodeCompare(current))) {
                current = current.parent;
            }
            if (current.parent == null || current.parent.getType() == edge) {
                return current.parent;
            }
        }
    }

    getParentRight() {
        if (this != null) {
            var current = this;
            
            while ((current.parent != null) && (current.parent.right.nodeCompare(current))) {
                current = current.parent;
            }
            if (current.parent == null || current.parent.getType() == edge) {
                return current.parent;
            }
        }
    }

    getFirstLeafLeft() { 
        if (this.left == null) {    
            return null;
        }
        var current = this.left;
        while (current.right != null) {
            current = current.left;
        }
        if (current.getType() == arc) {
            return current;
        }
    }

    getFirstLeafRight() {
        if (this.right == null) {
            return null;
        }
        var current = this.right;
        while (current.right != null) {
            current = current.left;
        }
        if (current.getType() == arc) {
            return current;
        }
    }
}

//things tthat are made when edge meets another arc this should not be in the beachline
//These only go into the completed vororoi diagram
class completeEdge {
    constructor(endpointA, endpointB) {
        this.endpointA = endpointA;
        this.endpointB = endpointB;
    }
    getType() {
        return completeEdge;
    }
}

class edgeIntersectionEvent {
    constructor(intersectionPoint, squeezedArc) {
        this.intersectionPoint = intersectionPoint;
        this.squeezedArc = squeezedArc;
        this.isValid;
    }
    getType(){
        return edgeIntersectionEvent;
    }
    isIntersectEqual(testEvnt){
        if(testEvnt.getType() == edgeIntersectionEvent){ 
        return (this.intersectionPoint.x == testEvnt.intersectionPoint.x) &&
            (this.intersectionPoint.y == testEvnt.intersectionPoint.y);
        }
        return false;
    }
}

//things that are made when there is an intersection of arcs and when sweep line == site
class edge extends node {
    constructor(start, direction) {
        super();
        this.start = start;
        this.direction = direction;
        this.extendsToInf = false;
    }
    getType() {
        return edge;
    }
    getKey() {
        return this.start;
    }
    isEqualEdge(testEdge) {
        if(testEdge.getType() == edge){
            return (testEdge.start.y == this.start.y) && 
            (testEdge.start.x == this.start.x) &&
            (testEdge.direction.y == this.direction.y) &&
            (testEdge.direction.y == this.direction.y) && 
            (testEdge.extendsToInf == this.extendsToInf); 
        }
        return false;
    }   
}

//Things that are made after passing a site
class arc extends node {
    constructor(focus) {
        super();
        this.focus = focus;
        this.squeezeEvent = null; //Should be class edgeintersection event
    }
    getType() {
        return arc;
    }
    getKey() {
        return this.focus;
    }

    isEqualArc(testArc){ 
        if(testArc.getType() == arc){
            if(this.parent != null && testArc.parent != null){
                if(this.parent.getType() == edge && testArc.parent.getType() == edge){
                    if((this.parent.isEqualEdge(testArc.parent)) &&
                    (this.focus.x == testArc.focus.x) &&
                    (this.focus.y == testArc.focus.y) &&
                    (this.left == testArc.left) && 
                    (this.right == testArc.right)){ //checking left and right to make sure they are both null
                        if(this.squeezeEvent != null && testArc.squeezeEvent != null){
                            return this.squeezeEvent.isIntersectEqual(testArc.squeezeEvent);
                        }
                        if(this.squeezeEvent == null && testArc.squeezeEvent == null){
                            return true
                        }
                    }
                }
            }else{
                if((this.focus.x == testArc.focus.x) &&
                (this.focus.y == testArc.focus.y) &&
                (this.left == testArc.left) && 
                (this.right == testArc.right)){
                    if(this.squeezeEvent != null && testArc.squeezeEvent != null){
                        return this.squeezeEvent.isIntersectEqual(testArc.squeezeEvent);
                    }
                    if(this.squeezeEvent == null && testArc.squeezeEvent == null){
                        return true
                    }
                }
            }
        }
        return false;
    }
}

//Sweep status where all the formulas and stuff go as they represent arcs and edges and stuff
class beachLineTree { //which represents arcs
    constructor() { //inital points
        this.root = null;
    }

    // insertRoot(newNode) { 
    //     if (this.root === null) {
    //         this.root = newNode;
    //     }
    // }
    insertNode(node) {
        //Sort depending on the x-coordinate
        var x = this.root;
        var y = null;
        //looks for next spot
        while (x != null) {
            y = x;
            //smaller x coordiante goes to left such taht the tree leaves would represent arcs..
            //..from left to right
            if (node.getKey() < x.getKey()) {
                x = x.left;
            }
            else {
                x = x.right;
            }
        }
        //checks which side node is placed
        if (y == null) {
            this.root = node;
        } else if (node.getKey() < y.getKey()) {
            y.left = node;
        } else {
            y.right = node;
        }
    }
    deleteLeaf(node) {//deletion

        let normalQueue = new prioQueue(); //BFS
        if (this.root != null) {
            normalQueue.normalEnqueue(this.root);
            while (!normalQueue.isEmpty()) {
                var current = normalQueue.pop();
                if (current.left == node) {
                    if (current.left.left == null && current.left.right == null) {//if its a leaf
                        current.left.parent = null;
                        current.left = null;

                        return;
                    }
                }

                if (current.right == node) {
                    if (current.right.left == null && current.right.right == null) {//if its a leaf
                        current.right.parent = null;
                        current.right = null;

                        return;
                    }
                }

                if (current.left != null) {
                    normalQueue.normalEnqueue(current.left);
                }
                if (current.right != null) {
                    normalQueue.normalEnqueue(current.right);
                }
            }
        }
    }
    getCount(){
        let normalQueue = new prioQueue(); //BFS   
        if (this.root != null) {
            var count = 1;
            normalQueue.normalEnqueue(this.root);
            while (!normalQueue.isEmpty()) {
                var current = normalQueue.pop();
                count++;
                if (current.left != null) {
                    normalQueue.normalEnqueue(current.left);
                }
                if (current.right != null) {
                    normalQueue.normalEnqueue(current.right);
                }
            }
            return count;
        }
    }
    findNode(node) {//basic node lookup
        let normalQueue = new prioQueue(); //BFS
        if (this.root != null) {
            normalQueue.normalEnqueue(this.root);
            while (!normalQueue.isEmpty()) {
                var current = normalQueue.pop();
                if (current == node) {
                    return true;
                }
                if (current.left != null) {
                    normalQueue.normalEnqueue(current.left);
                }
                if (current.right != null) {
                    normalQueue.normalEnqueue(current.right);
                }
            }
            return false;
        }
    }
    getList(){
        if(this.root != null){
            let normalQueue = new prioQueue();
            let list = [];
            normalQueue.normalEnqueue(this.root);
            while(!normalQueue.isEmpty()){
                var current = normalQueue.pop();
                list.push(current);
                if (current.left != null) {
                    normalQueue.normalEnqueue(current.left);
                }
                if (current.right != null) {
                    normalQueue.normalEnqueue(current.right);
                }
            }
            return list;
        }
    }
    //By x intersection
    findArcByX(site) {
        let normalQueue = new prioQueue(); //BFS
        if (this.root != null) {
            normalQueue.normalEnqueue(this.root);
            var closestIntersection = null;
            var closestDist = null;
            while (!normalQueue.isEmpty()) {
                var current = normalQueue.pop();
                if (current.getType() == arc) {
                    var direction = new THREE.Vector2(0, 1)
                    var verticalEdge = new edge(site, direction);
                    var intersect = this.getEdgeArcIntersectionPoint(verticalEdge, current, site.y);
                    //console.log(intersect);
                    if (intersect != false) {
                        var intDist = Math.sqrt((intersect.y - site.y) ^ 2);
                        //console.log(intDist);
                        if (intDist < closestDist || closestIntersection == null) {
                            closestIntersection = current;
                            closestDist = intDist;
                        }
                    }
                }
                if (current.left != null) {
                    normalQueue.normalEnqueue(current.left);
                }
                if (current.right != null) {
                    normalQueue.normalEnqueue(current.right);
                }
            }
            return closestIntersection;
        }
        return false
    }

    getEdgeArcIntersectionPoint(edge, arc, directrix) { //returns false if there is no intersection
        //Used when edge is a vertical line (Happens when two parabola have the same focus.y)
        if (edge.direction.x == 0) {
            if (directrix == arc.focus.y) {
                //This means that 2 vertical lines are interecting
                //console.log("Something weird is happening");
                var arcY = this.getYcoordForArc(arc, edge.start.x, directrix);
                const intersection = new THREE.Vector2(edge.start, arcY)
                //console.log(intersection);
                return intersection;
            }
            const intersection = new THREE.Vector2(edge.start.x, this.getYcoordForArc(arc, edge.start.x, directrix));
            return intersection;
        }
        //y = ax + b 
        var a = edge.direction.y / edge.direction.x;
        var b = edge.start.y - a * edge.start.x;
        //Arc is a vertical line (directrix == arc.focus.y)
        if (arc.focus.y == directrix) {
            var intersectionXOffset = arc.focus.x - edge.start.x; //should be 0
            if (intersectionXOffset * edge.direction < 0) {
                return null;
            }
            const intersection = new THREE.Vector2(arc.focus.x, a * arc.focus.x + b)

            return intersection;
        }
        // y = a_0 + a_1x + a_2x^2 Just quadratic fomula
        var a2 = 1 / (2 * (arc.focus.y - directrix));
        var a1 = -a - 2 * a2 * arc.focus.x;
        var a0 = a2 * arc.focus.x * arc.focus.x + (arc.focus.y + directrix) * 0.5 - b;
        //b^2 -4ac
        var discriminant = a1 * a1 - 4 * a2 * a0;
        if (discriminant < 0) {
            return null;
        }
        var rootDisc = Math.sqrt(discriminant);
        var x1 = (-a1 + rootDisc) / (2 * a2);
        var x2 = (-a1 - rootDisc) / (2 * a2);

        var x1Offset = x1 - edge.start.x;
        var x2Offset = x2 - edge.start.x;
        var x1Dot = x1Offset * edge.direction.x;
        var x2Dot = x2Offset * edge.direction.x;

        var x;
        if ((x1Dot >= 0) && (x2Dot < 0)) x = x1;
        else if ((x1Dot < 0) && (x2Dot >= 0)) x = x2;
        else if ((x1Dot >= 0) && (x2Dot >= 0)) {
            if (x1Dot < x2Dot) {
                x = x1;
            } else {
                x = x2;
            }
        }
        else {
            if (x1Dot < x2Dot) {
                x = x2;
            } else {
                x = x1;
            }
        }
        var y = this.getYcoordForArc(arc, x, directrix);
        var intersection = new THREE.Vector2(x, y);
        return intersection;
    }

    getYcoordForArc(arc, x, directrix) {
        var a = 1 / (2 * (arc.focus.y - directrix))
        var c = (arc.focus.y + directrix) * 1 / 2;
        var w = x - arc.focus.x;
        return a * w * w + c;
    }

    removeArcFromBeachLine(eventQueue, edgeIntersectionEvent, output)  { //SOMETHING WRONG HERE
        var squeezedArc = edgeIntersectionEvent.squeezedArc;
        if (edgeIntersectionEvent.isValid && squeezedArc.squeezeEvent == edgeIntersectionEvent) {
            var leftEdge = squeezedArc.getParentLeft();
            var rightEdge = squeezedArc.getParentRight();
            if ((leftEdge != null) && (rightEdge != null)){
                var leftArc = leftEdge.getFirstLeafLeft();
                var rightArc = rightEdge.getFirstLeafRight();
                if ((leftArc != null && rightArc != null) && !(rightArc.isEqualArc(leftArc))) {
                    //console.log("HELLO ITS ME");
                    //console.log("edgeIntersectionEvent", edgeIntersectionEvent);
                    var circleCentre = edgeIntersectionEvent.intersectionPoint;
                    // console.log("circleCentre", circleCentre);
                    var edgeA = new completeEdge(leftEdge.start, circleCentre);
                    var edgeB = new completeEdge(circleCentre, rightEdge.start);
                    if(leftEdge.extendsToInf){
                        //console.log("HI IM MAX NICE TO MEET YOU");
                        edgeA.endpointA.y.MAX_VALUE;
                    }
                    if(rightEdge.extendsToInf){
                        //console.log("HI IM MAX NICE TO MEET YOU");
                        edgeB.endpointA.y.MAX_VALUE;
                    }
                    // console.log(edgeA);
                    // console.log(edgeB);
                    output.push(edgeA);
                    output.push(edgeB);
                    var adjacentArcOffset = new THREE.Vector2(rightArc.focus.x - leftArc.focus.x,
                                                         (rightArc.focus.y - leftArc.focus.y));
                    var newEdgeDirection = new THREE.Vector2(adjacentArcOffset.y, -adjacentArcOffset.x);
                    newEdgeDirection = normalize(newEdgeDirection);
                    var newItem = new edge(circleCentre, newEdgeDirection);

                    var higherEdge = null;
                    var tempItem = squeezedArc;
                    while(tempItem.parent != null){
                        tempItem = tempItem.parent;
                        if(tempItem == leftEdge) higherEdge = leftEdge;
                        if(tempItem == rightEdge) higherEdge = rightEdge;
                    }
                    if((higherEdge != null) && (higherEdge.getType() == edge)){
                        newItem.setParentFromItem(higherEdge);
                        newItem.setLeft(higherEdge.left);
                        newItem.setRight(higherEdge.right);
                        if((squeezedArc.parent == null) || (squeezedArc.parent.getType() == edge)){
                            var remainingItem = null;
                            var parent = squeezedArc.parent;
                            if(squeezedArc.isEqualArc(parent.left)){
                                remainingItem = parent.right;
                            }else if(squeezedArc.isEqualArc(parent.right)){
                                remainingItem = parent.left;
                            }
                            if((parent.isEqualEdge(leftEdge) || parent.isEqualEdge(rightEdge)) && (!parent.isEqualEdge(higherEdge))){
                                remainingItem.setParentFromItem(parent);
                                var newRoot = this.root;
                                if((leftEdge.isEqualEdge(this.root)) || (rightEdge.isEqualEdge((this.root)))){
                                    newRoot = newItem;
                                }
                                if(squeezedArc.squeezeEvent != null){
                                    if(squeezedArc.isValid) squeezedArc.isValid = false;
                                }
                                // console.log(leftArc); ///////////////////////////////////
                                // console.log(rightArc);
                                this.addArcSqueezeEvent(eventQueue, leftArc);
                                this.addArcSqueezeEvent(eventQueue, rightArc);
                                return newRoot;
                            }
                        }
                    }
                }
            }
        }
    }

    

    addArcToBeachLine(eventQueue, sweepLine, site) {
        var replacedArc = this.getActiveArcForXCoord(this.root, site.x, site.y);//Gets first arc on the same x coordinate sweepLine
        
        if (replacedArc.getType() == arc) {
            
            var splitLeft = new arc(replacedArc.focus);
            var splitRight = new arc(replacedArc.focus);
            var newArc = new arc(site);
            var intersect = this.getYcoordForArc(replacedArc, site.x, sweepLine);
            if (isFinite(intersect)) {
                //Gets two points for a unit vector
                var edgeStart = new THREE.Vector2(site.x, intersect);
                var focusOffset = new THREE.Vector2(newArc.focus.x - replacedArc.focus.x,
                    newArc.focus.y - replacedArc.focus.y);

                var edgeDir = normalize(new THREE.Vector2(focusOffset.y, -focusOffset.x));//This is weird
                var edgeLeft = new edge(edgeStart, edgeDir);
                var edgeRight = new edge(edgeStart, new THREE.Vector2(-edgeDir.x, -edgeDir.y));
                
                if (replacedArc.left == null && replacedArc.right == null) {
                    edgeLeft.setParentFromItem(replacedArc);
                    edgeLeft.setLeft(splitLeft);
                    edgeLeft.setRight(edgeRight);
                    edgeRight.setLeft(newArc);
                    edgeRight.setRight(splitRight);

                    if (this.root.getType() == arc) {
                        if(this.root.isEqualArc(replacedArc)){
                            this.root = edgeLeft;
                        }
                    }
                    if(replacedArc.squeezeEvent != null){
                        replacedArc.squeezeEvent.isValid = false;
                    }

                    this.addArcSqueezeEvent(eventQueue, splitLeft);
                    this.addArcSqueezeEvent(eventQueue, splitRight);
                }
            }
        }
    }

    tryGetEdgeIntersection(edge1, edge2){
        var dx = edge2.start.x - edge1.start.x;
        var dy = edge2.start.y - edge1.start.y;
        if(dx == 0 && dy == 0){
            return false;
        }
        //Cross prod (det of the combined unit vectors)
        //console.log("Direction y:", edge1)
        var det = edge2.direction.x * edge1.direction.y - edge2.direction.y * edge1.direction.x;
        //console.log(det)
        
        var u = (dy * edge2.direction.x - dx * edge2.direction.y)/det;
        var v = (dy * edge1.direction.x - dx * edge1.direction.y)/det;
        if((u < 0) && !edge1.extendsToInf) return false;
        if((v < 0) && !edge2.extendsToInf) return false;
        if((u == 0) && (v == 0) && !edge1.extendsToInf && !edge2.extendsToInf) return false;

        return new THREE.Vector2(edge1.start.x + edge1.direction.x*u, edge1.start.y + edge1.direction.y*u);
    }

    addArcSqueezeEvent(eventQueue, arc) {
        var leftEdge = arc.getParentLeft();
        var rightEdge = arc.getParentRight();
        if ((leftEdge == null) || (rightEdge == null)) {
            return false;
        }
        
        var circleEventPoint = this.tryGetEdgeIntersection(leftEdge, rightEdge);
        //console.log("INSIDE ADD ARC SQUEEZE circleEvent", circleEventPoint);
        if(!circleEventPoint){ //Edges dont intersect
            return false;
        }
        
        var circleCentreOffset = new THREE.Vector2(arc.focus.x - circleEventPoint.x, 
                                                    arc.focus.y - circleEventPoint.y);
        var circleRadius = magnitude(circleCentreOffset);
        var circleEventY = circleEventPoint.y - circleRadius;
        //console.log(arc.squeezeEvent);
        if(arc.squeezeEvent != null){
            if(arc.squeezeEvent.intersectionPoint.y >= circleEventY){
                return false;
            }else{
                arc.squeezeEvent.isValid = false;
            }
        }
        
        var newEvent = new edgeIntersectionEvent(circleEventPoint, arc);
        newEvent.isValid = true;
        eventQueue.enqueue(newEvent, circleEventY, "squeeze");
        arc.squeezeEvent = newEvent;
        return true;
    }
    finishEdge(item, output){
        
        if(item == null){
            return;
        }
        if(item.getType() == edge){
            
            var length = 10000;
            var edgeEnd = item.start;
            // console.log("edgeEnd", edgeEnd)
            edgeEnd.x += length * item.direction.x;
            edgeEnd.y += length * item.direction.y;

            var newEdge = new completeEdge(item.start, edgeEnd);
            output.push(newEdge);
            //Recursively finish the remaining edges
            this.finishEdge(item.left, output);
            this.finishEdge(item.right, output);
        }
    }

    getActiveArcForXCoord(root, x, directrixY){
        var currentItem = root;
        var separatingEdge = null;
        while(currentItem.getType() != arc){
            //console.log("Current item", currentItem)
            if(currentItem.getType() == edge){
                var left = currentItem.getFirstLeafLeft();
                var right = currentItem.getFirstLeafRight();
            }
           
            if(((left != null) && (left.getType() == arc)) && ((right != null) && (right.getType() == arc))){
                var fromLeft = left.getParentRight();
                var fromRight = right.getParentLeft();
                //console.log(fromLeft.right , fromRight)
                if((fromLeft != null) && ((fromLeft.getType() == edge))){
                    // if((fromLeft.isEqualEdge(fromRight)) ||
                    // (this.compare(fromLeft.right, fromRight)) ||
                    // (this.compare(fromLeft.parent, fromRight))){
                        separatingEdge = fromLeft;
                    //}
                }
            }
            //console.log("Seperating Edges", separatingEdge);
            var leftIntersect = this.getEdgeArcIntersectionPoint(separatingEdge, left, directrixY);
            var rightIntersect = this.getEdgeArcIntersectionPoint(separatingEdge, right, directrixY);
            
            var intersectionX = leftIntersect.x;
            //if left didnt intersect and right intersected

            if((typeof(leftIntersect) == 'boolean') && !((typeof(rightIntersect) == 'boolean'))) 
            {
                intersectionX = rightIntersect.x;
            }
    
            if(x < intersectionX)
            {
                currentItem = currentItem.left;
            }
            else
            {
                currentItem = currentItem.right;
            }
        }

        return currentItem;
    }

    compare(obj1, obj2){ //EDGES AND ARCS ONLY
        if(obj1 != null && obj2 != null){
            if(obj1.getType() == obj2.getType()){
                if(obj1.getType() == arc){
                    return obj1.isEqualArc(obj2);
                }
                if(obj1.getType() == edge){
                    return obj1.isEqualEdge(obj2)
                }
            }
        }
        return false;
    }
}

export { beachLineTree, edge, completeEdge, arc, node, edgeIntersectionEvent }