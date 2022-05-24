import * as THREE from '../libraries/three.module.js';
import { prioQueue } from './queue.js';
import { beachLineTree, edge, completeEdge, arc, node } from './beachLine.js';

//Thanks to: https://jacquesheunis.com/post/fortunes-algorithm/

function fortunes(sites) { //sites is a array of THREE.Vector2
    let queue = new prioQueue();
    let beachLine = new beachLineTree();
    let output = [];
    for (let i = 0; i < sites.length; i++) {
        queue.enqueue(sites[i], sites[i].y, "site")
    }
    //queueTest();
    //We insert first item to beachLine manually
    var firstEvent = queue.pop();
    var firstNode = new arc(firstEvent.element);
    beachLine.insertNode(firstNode);
    var startupSpecialCaseEndY = firstNode.focus.y - 1;
    while(!queue.isEmpty() && (queue.peak().priority > startupSpecialCaseEndY)){
        var evt = queue.peak();
        queue.pop();
        console.log('inside special');
        if(evt.event == "site"){
            var newFocus = evt.element;
            var newArc = new arc(newFocus);
            var activeArc = beachLine.getActiveArcForXCoord(beachLine.root, newFocus.x, newFocus.y);
            if(activeArc.getType() == arc){
                var edgeStart = new THREE.Vector2(((newFocus.x + activeArc.focus.x)/2), newFocus.y+100.0);
                var edgeDir = new THREE.Vector2(0, -1);
                var newEdge = new edge(edgeStart, edgeDir);
                newEdge.extendsToInf = true;
                if(activeArc.parent != null){
                    console.log("THIS SHOULD NEVER BE TRUE");
                    if(activeArc == activeArc.parent.left){
                        activeArc.parent.setLeft(newEdge);
                    }else if(activeArc == activeArc.parent.right){
                        activeArc.parent.setRight(newEdge);
                    }
                }else{
                    beachLine.root = newEdge;
                }
                if(newFocus.x < activeArc.focus.x){
                    newEdge.setLeft(newArc);
                    newEdge.setRight(activeArc);
                }else{
                    newEdge.setLeft(activeArc);
                    newEdge.setRight(newArc);
                }
            }   
        }
    }

    
    while (!queue.isEmpty()) {
        var a = queue.peak(); //a CONTAINS QUEUE RELATED ATTRIBUTES REMEMBER TO GET ELEMENT
        if (a.event == "site") {
            beachLine.addArcToBeachLine(queue, a.element.y,a.element);
            //beachLine.root = beachLine.addArcToBeachLine(queue, a.element.y,a.element);
            //Handle site event
            //console.log("Sugma");
        } else if(a.event == "squeeze"){
            if(a.element.isValid){//Circle event find arc that will disapear
                beachLine.removeArcFromBeachLine(queue, a.element, output);
                //beachLine.root = beachLine.removeArcFromBeachLine(queue, a.element, output);
                //console.log("CirculDeez");
            }
        }else{
            console.log("Random event");
        }
        queue.pop();
        //console.log(a);
        //Treat remaining nodes of T as unbounded edges
    }
    if(queue.isEmpty()){
        a = beachLine.getList();
        beachLine.finishEdge(beachLine.root, output);
    }
 
    //console.log(output);
    return output;
    
}

function queueTest(){
    let queue = new prioQueue();
    queue.enqueue("First to be put in", -15, "string");
    queue.enqueue("Second to be put in", -11, "string");
    queue.enqueue("Third to be put in", -13, "string");
    queue.enqueue("Forth to be put in", -10, "string");

    console.log(queue.pop());
}




function radixSort(array) { //Useless like me
    let maxNum = 0;
    for (let i = 0; i < array.length; i++) {
        if (array[i].y > maxNum) {
            maxNum = array[i].y;
        }
    }
    maxNum *= 10;
    let divisor = 10; //starting unit 0 - 9
    while (divisor < maxNum) {
        let buckets = [...Array(10)].map(() => []);
        for (let i = 0; i < array.length; i++) {
            buckets[Math.abs(Math.floor((array[i].y % divisor) / (divisor / 10)))].push(array[i]);
        }
        array = [].concat.apply([], buckets);
        divisor *= 10;
    }

    return array;
}
export { fortunes };