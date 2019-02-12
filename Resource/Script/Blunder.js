function main(){
    let blunder = new Blunder();
    RenderResourceManager.getInstance().loadResources().then(()=>{
        blunder.initializeResources();
        blunder.renderingLoop();
    });
}

var textureMapTypeArray = ['diffuse', 'normal', 'specular', 'gloss'];

class Blunder{

    constructor(){

    }

    initializeResources() {

    }

    renderingLoop() {

    }

    static getInstance() {
        if (!this.instance)
            this.instance = new this();
        return this.instance;
    }
}

class RenderResourceManager{

    constructor(){
        this.textureMaps = [];
        this.shaders = [];
        this.vertexData = [];
    }

    async loadResources() {
        let manifest = await Utility.loadJSONResource("./Resource/manifest.json")
            .then(result => result['objects']);
        console.log(manifest);
        return await RenderResourceManager.getInstance().loadManifestContents(manifest);
    }

    async loadManifestContents(manifest){
        let loadingInterfaceObjectArray = [];
        for(let property in manifest){
            if(manifest.hasOwnProperty(property)){
                this.loadObjectResources(manifest[property]).then(result => loadingInterfaceObjectArray.push(result));
            }
        }
        return loadingInterfaceObjectArray;
    }

    async loadObjectResources(object){
        if(object.hasOwnProperty("data")) {
            let lio = new LoadingInterfaceObject(object['name']);
            let data = object["data"];
            console.info("Loading "+object["name"]+"...");
            return lio.loadInterfaceObjectData(data);
        }
    }

    insertTextureMap(texture){
        if(this.textureMaps.includes(texture)){
            return this.textureMaps.indexOf(texture);
        }
        else{
            return this.textureMaps.push(texture)-1;
        }
    }

    getTextureMap(textureIndex){
        return this.textureMaps[textureIndex];
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

    getVertexData(meshIndex){
        return this.vertexData[meshIndex];
    }

    static getInstance() {
        if (!this.instance)
            this.instance = new this();
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

        this.color = [Math.random(),Math.random(),Math.random()];

        this.position = [0.0,0.0,0.0];

        this.shaderCodeObject = null;
    }

    //<editor-fold desc="all the loading code">

    async loadInterfaceObjectData(data){
        this.loadMeshData(data['model']);
        this.loadTextures(data);
        this.loadShaders(data);
        return this;
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

    async loadTextures(data){
        let tio = {};
        let textureMapPaths = data.hasOwnProperty('textureMaps') ? data['textureMaps'] : {};
        for (let textureMapType of textureMapTypeArray)
            if(textureMapPaths.hasOwnProperty(textureMapType))
                this.loadTextureMap(textureMapPaths[textureMapType]).then(result => tio[textureMapType+'MapIndex']=result);
        this.textureIndexObject = tio;
    }

    async loadTextureMap(texturePath){
        console.log(texturePath);
        let texture = await Utility.loadImage(texturePath);
        return RenderResourceManager.getInstance().insertTextureMap(texture);
    }

    async loadShaders(data){
        //space for multi shader loading
        this.loadShaderCodeObjects(data.hasOwnProperty('shaders') ? data['shaders'] : {});
    }

    async loadShaderCodeObjects(shaderPathObject) {
        if(shaderPathObject.hasOwnProperty("vertex") && shaderPathObject.hasOwnProperty('fragment')){
            this.loadSpecificShaders(shaderPathObject).then(result => this.shaderCodeObject=result);
        }
        else{
            this.loadGenericShaders().then(result => this.shaderCodeObject=result);
        }
    }

    async loadSpecificShaders(shaderPaths){
        let vertexShader = await Utility.loadTextResourceFromFile(shaderPaths['vertex']);
        let fragmentShader = await Utility.loadTextResourceFromFile(shaderPaths['fragment']);
        return {"vertex": vertexShader, "fragment": fragmentShader};
    }

    async loadGenericShaders() {
        let genericShaders = {
            "vertex": "./Resource/Shader/genericShader.vert",
            "fragment": "./Resource/Shader/genericShader.frag"
        };
        return await this.loadSpecificShaders(genericShaders);
    }

    //</editor-fold>

    initializeResources(){
        //todo: compile shaders, initialize buffers
    }

    getVertexShaderCode(){
        if(this.shaderCodeObject!=null && this.shaderCodeObject.hasOwnProperty("vertex"))
            return this.shaderCodeObject.vertex;
        throw new Error("LoadingInterfaceObject has no vertex shader code");
    }

    getFragmentShaderCode(){
        if(this.shaderCodeObject!=null && this.shaderCodeObject.hasOwnProperty("fragment"))
            return this.shaderCodeObject.fragment;
        throw new Error("LoadingInterfaceObject has no fragment shader code");
    }
}

class ShaderHelper{

    static createShaderProgram(context, vertexCode, fragmentCode){
        let vertexShader = ShaderHelper.compileShader(context, vertexCode, context.VERTEX_SHADER);
        let fragmentShader = ShaderHelper.compileShader(context, fragmentCode, context.FRAGMENT_SHADER);
        let shaderProgram = ShaderHelper.linkShaderProgram(context, vertexShader, fragmentShader);
        ShaderHelper.validateShaderProgram(shaderProgram);
        return shaderProgram;
    }

    static compileShader(context, shaderCode, shaderType){
        let compiledShader = context.createShader(shaderType);
        context.shaderSource(compiledShader, shaderCode);
        ShaderHelper.compileShader(compiledShader);
        ShaderHelper.checkShaderCompilationStatus(compiledShader);
        return compiledShader;
    }

    static linkShaderProgram(context, vertexShader, fragmentShader){
        let shaderProgram = context.createProgram();
        context.attachShader(shaderProgram, vertexShader);
        context.attachShader(shaderProgram, fragmentShader);
        context.linkProgram(shaderProgram);
        ShaderHelper.checkProgramLinkStatus(shaderProgram);
        return shaderProgram;
    }

    static checkShaderCompilationStatus(context, compiledShader){
        if(!context.getShaderParameter(compiledShader, context.COMPILE_STATUS)){
            throw new Error("Error in Shader Compilation!\n"+ context.getShaderInfoLog(compiledShader));
        }
    }

    static checkProgramLinkStatus(context, shaderProgram) {
        if(!context.getProgramParameter(shaderProgram, context.LINK_STATUS)){
            throw new Error("Error linking program!\n" + context.getProgramInfoLog(shaderProgram));
        }
    }

    static validateShaderProgram(context, shaderProgram){
        if(!context.getProgramParameter(shaderProgram, context.VALIDATE_STATUS)){
            throw new Error("Error validating program!\n" + context.getProgramInfoLog(shaderProgram));
        }
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
