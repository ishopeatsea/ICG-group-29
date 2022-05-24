class Selector{
    constructor(){
        this.selectionList = ['gravity', 'buildings'];
        this.currentSelection = 'gravity';
    }

    placeItem(){
        return this.selectionList.indexOf(currentSelection);
    }

    changeSelection(newSelection){
        this.currentSelection = newSelection;
        console.log("Selection changed to ", newSelection)
    }
}

export { Selector };