function main(){
    ResourceLoader.loadResources().then(result =>{
        console.log(result[0]["shaderCodeObject"]);
        console.log(result[1]["shaderCodeObject"]);
        console.log(result[2]["shaderCodeObject"]);
        DrawableObjectInitializer.initializeResources();
        Blunder.getInstance().renderingLoop();
    });
}

const TEXTURE_MAP_TYPES = ['diffuse', 'normal', 'specular', 'gloss'];
const JSON_VERTEX_DATA_FIELDS = ['vertices', 'normals', 'faces', 'texturecoords'];
const VERTEX_DATA_TYPES = ['vertex', 'normal', 'index', 'textureCoordinate'];

class Blunder{

    constructor(){
        this.canvas = document.getElementById('viewport');
    }

    initializeResources() {
        this.initializeWebGL();
    }

    renderingLoop() {

    }

    initializeWebGL(){
        this.context = Blunder.initializeWebGLContext(this.canvas);
        this.context.clearColor(.75, .85, .8, 1.0);
        this.context.clear(this.context.COLOR_BUFFER_BIT | this.context.DEPTH_BUFFER_BIT);
        this.context.enable(this.context.DEPTH_TEST);
        this.context.enable(this.context.CULL_FACE);
    }

    static getWebGLContext(){
        return this.getInstance().context;
    }

    static initializeWebGLContext(canvas){
        let context = canvas.getContext('webgl');
        if(!context)
             return canvas.getContext('experimental-webgl');
        if(!context)
            throw new Error("Unable to get WebGL context");
        return context;
    }

    static getInstance() {
        if (!this.instance)
            this.instance = new this();
        return this.instance;
    }
}

class BufferObjectStruct{

    constructor(){
        this.textureBuffer = [];
        this.shaderPrograms = [];
        this.vertexBuffer = [];
    }

    //<editor-fold desc="inserts and getter">

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

    //</editor-fold>

    static getInstance() {
        if (!this.instance)
            this.instance = new this();
        return this.instance;
    }
}

class RawObjectDataStruct {

    constructor(name){
        this.objectName = name;

        this.dataArrays = {
            vertex : null,
            normal : null,
            index : null,
            textureCoordinate : null
        };

        this.textures = {
            diffuse : null,
            normal : null,
            specular : null,
            gloss : null
        };

        this.color = [Math.random(),Math.random(),Math.random()];

        this.position = [0.0,0.0,0.0];

        this.shaderCodeObject = null;
    }

    getVertexShaderCode(){
        if(this.shaderCodeObject!=null && this.shaderCodeObject.hasOwnProperty("vertex"))
            return this.shaderCodeObject.vertex;
        throw new Error("RawObjectData has no vertex shader code");
    }

    getFragmentShaderCode(){
        if(this.shaderCodeObject!=null && this.shaderCodeObject.hasOwnProperty("fragment"))
            return this.shaderCodeObject.fragment;
        throw new Error("RawObjectData has no fragment shader code");
    }
}

class DrawableObject{

    constructor(){
        this.BufferIndices = {
            vertexBufferIndex : null,
            normalBufferIndex : null,
            indexBufferIndex : null,
            textureCoordinateBufferIndex :null
        };
        this.shaderProgramIndex = null;
    }
}

class DrawableObjectInitializer{
    static initializeDrawableObject(rods){
        let drawableObject = new DrawableObject();
        //todo: compile shaders, initialize buffers
        drawableObject.shaderProgramIndex = DrawableObjectInitializer.initializeShader(rods);
        DrawableObjectInitializer.initializeBuffers(rods, drawableObject);
        return drawableObject;
    }

    static initializeShader(rods){
        let shader = ShaderHelper.createShaderProgram(Blunder.getWebGLContext(), rods.getVertexShaderCode(), rods.getFragmentShaderCode());
        return RawObjectDataStruct.getInstance().insertShader(shader);
    }

    static initializeBuffers(rods, drawableObject) {
        DrawableObjectInitializer.initializeVertexDataBuffers(rods);
        initializeTextureBuffers();
    }

    static initializeVertexDataBuffers(rods) {
        let ctxTemp = Blunder.getWebGLContext();
        for(let perVertexDataType in rods.dataArrays){
            let vertDataBuffer = ctxTemp.createBuffer();
            ctxTemp.bindBuffer()
            //todo: continue buffer initialization

        }
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

class ResourceLoader{

    static async loadResources() {
        let manifest = await Utility.loadJSONResource("./Resource/manifest.json")
            .then(result => result['objects']);
        return await ResourceLoader.loadManifestContents(manifest);
    }

    static async loadManifestContents(manifest){
        let rawObjectDataArray = [];
        for(let property in manifest)
            if(manifest.hasOwnProperty(property))
                await ResourceLoader.loadObjectResources(manifest[property]).then(result => {rawObjectDataArray.push(result);});
        return await Promise.all(rawObjectDataArray).then(()=>{return rawObjectDataArray;});
    }

    static async loadObjectResources(object){
        if(object.hasOwnProperty("data")) {
            let rawData = new RawObjectDataStruct(object['name']);
            let data = object["data"];
            console.info("Loading "+object["name"]+"...");
            return await ResourceLoader.loadInterfaceObjectData(data, rawData);
        }
    }

    static async loadInterfaceObjectData(data, rods){
        await ResourceLoader.loadMeshData(data['model']).then(result => {rods.dataArrays = result;});
        await ResourceLoader.loadTextures(data).then(result => {rods.textures = result;});
        await ResourceLoader.loadShaders(data).then(result => {rods.shaderCodeObject = result;});
        return rods;
    }

    static async loadMeshData(modelPath) {
        return Utility.loadJSONResource(modelPath).then(modelData => {
            let vertexDataObject = {};
            if(modelData.hasOwnProperty('meshes'))
                for(let dataTypeIndex = 0; dataTypeIndex<JSON_VERTEX_DATA_FIELDS.length; dataTypeIndex++)
                    vertexDataObject[VERTEX_DATA_TYPES[dataTypeIndex]] = ResourceLoader.extractMeshData(modelData['meshes'][0], JSON_VERTEX_DATA_FIELDS[dataTypeIndex]);
            return vertexDataObject;});
    }

    static async extractMeshData(modelData, fieldName){
        return modelData.hasOwnProperty(fieldName) ?
            fieldName === 'faces' ? [].concat.apply([], modelData[fieldName]) :
                fieldName === 'texturecoords' ? modelData[fieldName][0] :
                    modelData[fieldName] : -1;
    }

    static async loadTextures(data){
        let textures = {};
        let textureMapPaths = data.hasOwnProperty('textureMaps') ? data['textureMaps'] : {};
        for (let textureMapType of TEXTURE_MAP_TYPES)
            if(textureMapPaths.hasOwnProperty(textureMapType))
                ResourceLoader.loadTextureMap(textureMapPaths[textureMapType]).then(result => textures[textureMapType]=result);
        return textures;
    }

    static async loadTextureMap(texturePath){
        return await Utility.loadImage(texturePath);
    }

    static async loadShaders(data){
        //space for multi shader loading
        return ResourceLoader.loadShaderCode(data.hasOwnProperty('shaders') ? data['shaders'] : null);
    }

    static async loadShaderCode(shaderPaths){
        let shaderCodeObject = {"vertex": null, "fragment": null};
        if(!shaderPaths)
            shaderPaths = {vertex: "./Resource/Shader/genericShader.vert", fragment: "./Resource/Shader/genericShader.frag"};
        await Utility.loadTextResourceFromFile(shaderPaths['vertex']).then(vertResult => {shaderCodeObject.vertex = vertResult});
        await Utility.loadTextResourceFromFile(shaderPaths['fragment']).then(fragResult => {shaderCodeObject.fragment = fragResult});
        return shaderCodeObject;
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
