function main(){
    let blunder = new Blunder();
    blunder.loadResources().then(()=>{
        blunder.initializeResources();
        blunder.renderingLoop();
    });
}

class Blunder{

    async loadResources() {

    }

    initializeResources() {

    }

    renderingLoop() {

    }
}

class Utility{
    static loadTextResourceFromFile(url){
        return fetch(url).then(res => res.text());
    }
}