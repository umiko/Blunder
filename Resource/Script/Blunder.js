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
                this.loadObjectResources(manifest[property]);
            }
        }
    }

    async loadObjectResources(object){
        if(object.hasOwnProperty("data")) {
            let lio = new LoadingInterfaceObject(object['name']);
            let data = object["data"];
            console.info("Loading "+object["name"]+"...");
            lio.loadInterfaceObjectData(data);
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

        this.textureIndexObject = null;

        this.colorIndex = null;

        this.position = [0.0,0.0,0.0];

        this.shaderCodeObject = null;
    }

    loadInterfaceObjectData(data){
        this.loadMeshData(data['model']);
        if(data.hasOwnProperty('textureMaps'))
            this.loadTextures(data['textureMaps']);
        console.log(this);
    }

    //<editor-fold desc="model data loading">

    async loadMeshData(modelPath) {
        Utility.loadJSONResource(modelPath).then(modelData => {
            if(modelData.hasOwnProperty('meshes')) {
                this.extractVertexData(modelData['meshes'][0]).then(result => this.vertexIndex = result);
                this.extractNormalData(modelData['meshes'][0]).then(result => this.normalIndex = result);
                this.extractIndexData(modelData['meshes'][0]).then(result => this.indexIndex = result);
                this.extractTextureCoordinateData(modelData['meshes'][0]).then(result => this.textureCoordinateIndex = result);
            }
        });
    }

    async extractVertexData(modelData){
        if(modelData.hasOwnProperty('vertices')) {
            let meshData = modelData['vertices'];
            return RenderResourceManager.getInstance().insertVertexData(meshData);
        }
        else
            return -1;
    }

    async extractNormalData(modelData) {
        if(modelData.hasOwnProperty('normals')) {
            let meshData = modelData['normals'];
            return RenderResourceManager.getInstance().insertVertexData(meshData);
        }
        else
            return -1;
    }

    async extractIndexData(modelData){
        if(modelData.hasOwnProperty('faces')){
            let meshData = [].concat.apply([], modelData['faces']);
            return RenderResourceManager.getInstance().insertVertexData(meshData);
        }
        else
            return -1;
    }

    async extractTextureCoordinateData(modelData){
        if(modelData.hasOwnProperty('texturecoords')){
            let meshData = modelData['texturecoords'][0];
            return RenderResourceManager.getInstance().insertVertexData(meshData);
        }
        else
            return -1;
    }

    //</editor-fold>

    async loadTextures(textureMaps){
        let textureMapTypeArray = ['diffuse', 'normal', 'specular', 'gloss'];
        let tio = {};
        for (let textureMapType of textureMapTypeArray){
            if(textureMaps.hasOwnProperty(textureMapType))
                this.loadTextureMap(textureMaps[textureMapType]).then(result => tio[textureMapType+'MapIndex']=result);
        }
        this.textureIndexObject = tio;
    }

    async loadTextureMap(texturePath){
        console.log(texturePath);
        let texture = await Utility.loadImage(texturePath);
        return RenderResourceManager.getInstance().insertTexture(texture);
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

    static async loadImage(textureMapPath){
        return new Promise(resolve => {
            this.loadImageWithCallback(textureMapPath, resolve);
        });
    }

    static loadImageWithCallback(url, callback) {
        let image = new Image();
        image.onload = function () {
            callback(image);
        };
        image.src = url;
    };
}