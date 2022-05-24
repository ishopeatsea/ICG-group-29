class queueElement{
    constructor(element, priority, event){
        this.element = element;
        this.priority = priority;
        this.event = event;
    }
}

//For site events and circle events
class prioQueue{ //LOWEST PRIORITY SMALLER THE NUMBER MAKES THE SORTING EASIER (NOT TRADITIONAL PRIOQ)
 constructor(){
    this.queue = [];
 }
 normalEnqueue(element){
    this.queue.push(element);
 }
 enqueue(element, priority, event){
     let queueEle = new queueElement(element, priority, event);
     let contain = false;
     for(let i = 0; i < this.queue.length; i++){
        if(this.queue[i].priority < queueEle.priority){
            this.queue.splice(i, 0, queueEle);
            contain = true;
            break;
        }
        if(this.queue[i].priority == queueEle.priority){ //Kinda works if more than 2 in a the same y then it doesnt
            if(this.queue[i].element.x < queueEle.element.x){
                this.queue.splice(i+1, 0, queueEle);
                contain = true;
            }else{
                this.queue.splice(i, 0, queueEle);
                contain = true;
            }
            break;
        }
     }
     if(!contain){
        this.queue.push(queueEle);
     }
 }
 pop(){
     if(!this.isEmpty()){
        return this.queue.shift();
     }
 }
 peak(){
    return this.queue[0];
 }
 isEmpty(){
    return this.queue.length == 0;
 }
 print(){
    console.log(this.queue);
 }
}
export { prioQueue };