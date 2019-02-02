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
            .then(result => result['objects']);
        console.log(manifest);
        await RenderResourceManager.getInstance().loadManifestContents(manifest);
    }

    initializeResources() {

    }

    renderingLoop() {

    }
}

class RenderResourceManager{

    constructor(){
        this.textures = [];
        this.shaders = [];
        this.shaderCodeObjects = [];
        this.meshes = [];
    }

    async loadManifestContents(manifest){
        for(let property in manifest){
            if(manifest.hasOwnProperty(property)){
                await this.loadObjectResources(manifest[property]);
            }
        }
    }

    async loadObjectResources(object){
        if(object.hasOwnProperty("data")) {
            let data = object["data"];
            console.info("Loading "+object["name"]+"...");
            this.loadShaders(data);
        }
    }

    async loadShaders(objectData) {
        if(objectData.hasOwnProperty("shader")){
            this.loadSpecificShaders(objectData["shader"]);
        }
        else{
            this.loadGenericShaders().then(result => this.shaderCodeObjects.push(result));
        }
    }

    async loadSpecificShaders(shaderPaths){
        let vertexShader = Utility.loadTextResourceFromFile(shaderPaths['vertex']);
        let fragmentShader = Utility.loadTextResourceFromFile(shaderPaths['fragment']);
        return {vertexShader,fragmentShader};
    }

    async loadGenericShaders() {
        let genericShaders = {
            "vertex": "./Resource/Shader/genericShader.vert",
            "fragment": "./Resource/Shader/genericShader.frag"
        };
        return this.loadSpecificShaders(genericShaders);
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
        if(!this.instance)
            this.instance = new RenderResourceManager();
        return this.instance;
    }
}

class DrawableObject {

}

class Utility{
    static loadTextResourceFromFile(url){
        return fetch(url).then(res => res.text());
    }

    static loadJSONResource(url){
        return this.loadTextResourceFromFile(url).then(file => JSON.parse(file));
    }
}