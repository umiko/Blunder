function main(){
    let blunder = new Blunder();
    blunder.loadResources().then(()=>{
        blunder.initializeResources();
        blunder.renderingLoop();
    });
}

class Blunder{

    async loadResources() {
        let manifest = Utility.loadJSONResource("./Resource/manifest.json");
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

    static loadJSONResource(url){
        return this.loadTextResourceFromFile(url).then(file => JSON.parse(file));
    }
}