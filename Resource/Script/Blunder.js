function main(){
    let blunder = new Blunder();
    blunder.loadResources().then(()=>{
        blunder.initializeResources();
        blunder.renderingLoop();
    });
}

class Blunder{

    async loadResources() {
        let manifest = await Utility.loadJSONResource("./Resource/manifest.json")
            .then(result => result.objects);
        console.log(manifest);
        //durch properties gehen, ist kein array
        manifest.map(object.proper => RenderResourceManager.getInstance().loadObjectResources(object))
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

class RenderResourceManager{

    constructor(){
        this.textures = [];
        this.shaders = [];
        this.meshes = [];
    }

    loadObjectResources(object){
        console.log(object);
    }

    insertTexture(texture){
        if(this.textures.includes(texture)){
            return this.textures.indexOf(texture);
        }
        else{
            return this.textures.push(texture)-1;
        }
    }

    getTexture(textureIndex){
        return this.textures[textureIndex];
    }

    insertShader(shader){
        if(this.shaders.includes(shader)){
            return this.shaders.indexOf(shader);
        }
        else{
            return this.shaders.push(shader)-1;
        }
    }

    getShader(shaderIndex){
        return this.shaders[shaderIndex];
    }

    insertMesh(mesh){
        if(this.meshes.includes(mesh)){
            return this.meshes.indexOf(mesh);
        }
        else{
            return this.meshes.push(mesh)-1;
        }
    }

    getMesh(meshIndex){
        return this.meshes[meshIndex];
    }

    static getInstance() {
        if(this.instance){
            return this.instance;
        }
        else{
            this.instance = new RenderResourceManager();
        }
    }
}