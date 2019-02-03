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
        this.vertexData = [];
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
            let lio = new LoadingInterfaceObject(object['name']);
            let data = object["data"];
            console.info("Loading "+object["name"]+"...");
            this.loadObjectDataToInterfaceObject(data, lio);
        }
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

    insertVertexData(dataArray){
        if(this.vertexData.includes(dataArray)){
            return this.vertexData.indexOf(dataArray);
        }
        else{
            return this.vertexData.push(dataArray)-1;
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

class LoadingInterfaceObject {
    constructor(name){
        this.objectName = name;

        this.vertexIndex = null;
        this.normalIndex = null;
        this.indexIndex = null;
        this.textureCoordinateIndex = null;

        this.textureIndex = null;
        this.specularIndex = null;
        this.normalMapIndex = null;
        this.glossIndex = null;

        this.colorIndex = null;

        this.position = [0.0,0.0,0.0];

        this.shaderCodeObject = null;
    }

    loadInterfaceObjectData(data){
        this.loadMeshData(data);
    }

    loadMeshData(data) {
        let modelData = Utility.loadJSONResource(data['model']);
        if(modelData.hasOwnProperty('meshes')) {
            this.extractVertexData(modelData['meshes']).then(result => this.vertexIndex = result);
            this.extractNormalData(modelData['meshes']).then(result => this.normalIndex=result);
            this.extractIndexData(modelData['meshes']).then(result => this.indexIndex = result);
        }
    }

    async extractModelData(modelData){
        const modelDataTypes = ['vertices', 'normals', 'faces', 'texturecoordinates'];
        for(let datatype in modelDataTypes){
            //todo: write function to extract data by type, taking care of the faces edge case
        }
    }

    async extractVertexData(modelData){
        if(modelData[0].hasOwnProperty('vertices')) {
            let meshData = modelData['meshes'][0]['vertices'];
            return RenderResourceManager.getInstance().insertVertexData(meshData);
        }
    }

    async extractNormalData(modelData) {
        if(modelData[0].hasOwnProperty('normals')) {
            let meshData = modelData['meshes'][0]['normals'];
            return RenderResourceManager.getInstance().insertVertexData(meshData);
        }
    }

    async extractIndexData(modelData){
        if(modelData[0].hasOwnProperty('faces')){
            let meshData = [].concat.apply([], modelData['meshes'][0]['faces']);
            return RenderResourceManager.getInstance().insertVertexData(meshData);
        }
    }

    async extractTextureCoordinateData(modelData){
        if(modelData[0].hasOwnProperty('texturecoordinates')){
            let meshData = modelData['meshes'][0]['texturecoordinates'][0];
            return RenderResourceManager.getInstance().insertVertexData(meshData);
        }
    }

    async loadShaderCodeObjects(objectData) {
        if(objectData.hasOwnProperty("shader")){
            this.loadSpecificShaders(objectData["shader"]).then(result => this.shaderCodeObject=result);
        }
        else{
            this.loadGenericShaders().then(result => this.shaderCodeObject=result);
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
}

class Utility{
    static loadTextResourceFromFile(url){
        return fetch(url).then(res => res.text());
    }

    static loadJSONResource(url){
        return this.loadTextResourceFromFile(url).then(file => JSON.parse(file));
    }
}