function main(){
    ResourceLoader.loadResources().then(result =>{
        DrawableObjectInitializer.initializeResources();
        Blunder.getInstance().renderingLoop();
    });
}

const TEXTURE_MAP_TYPES = ['diffuse', 'normal', 'specular', 'gloss'];
const VERTEX_DATA_FIELDS = ['vertices', 'normals', 'faces', 'texturecoords'];
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

    //<editor-fold desc="all the loading code">

    async loadInterfaceObjectData(data){
        this.loadMeshData(data['model']);
        this.loadTextures(data);
        this.loadShaders(data);
        return this;
    }

    static

    //<editor-fold desc="model data loading">



    //</editor-fold>

    async loadTextures(data){
        let tio = {};
        let textureMapPaths = data.hasOwnProperty('textureMaps') ? data['textureMaps'] : {};
        for (let textureMapType of textureMapTypeArray)
            if(textureMapPaths.hasOwnProperty(textureMapType))
                ResourceLoader.loadTextureMap(textureMapPaths[textureMapType]).then(result => tio[textureMapType+'MapIndex']=result);
        this.textureIndexObject = tio;
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
            vertex: "./Resource/Shader/genericShader.vert",
            fragment: "./Resource/Shader/genericShader.frag"
        };
        return await this.loadSpecificShaders(genericShaders);
    }

    //</editor-fold>

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
        this.shaderIndex = null;
    }
}

class DrawableObjectInitializer{
    static initializeDrawableObject(lio){
        let drawableObject = new DrawableObject();
        //todo: compile shaders, initialize buffers
        drawableObject.shaderIndex = DrawableObjectInitializer.initializeShader(lio);
        DrawableObjectInitializer.initializeBuffers(lio, drawableObject);
        return drawableObject;
    }

    static initializeShader(lio){
        let shader = ShaderHelper.createShaderProgram(Blunder.getWebGLContext(), lio.getVertexShaderCode(), lio.getFragmentShaderCode());
        return RawObjectDataStruct.getInstance().insertShader(shader);
    }

    static initializeBuffers(lio, drawableObject) {
        initializeVertexDataBuffers();
        initializeTextureBuffers();
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
        let loadingInterfaceObjectArray = [];
        for(let property in manifest){
            if(manifest.hasOwnProperty(property)){
                ResourceLoader.loadObjectResources(manifest[property]).then(result => loadingInterfaceObjectArray.push(result));
            }
        }
        return loadingInterfaceObjectArray;
    }

    static async loadObjectResources(object){
        if(object.hasOwnProperty("data")) {
            let lio = new RawObjectData(object['name']);
            let data = object["data"];
            console.info("Loading "+object["name"]+"...");
            return lio.loadInterfaceObjectData(data);
        }
    }

    static async loadTextureMap(texturePath){
        console.log(texturePath);
        let texture = await Utility.loadImage(texturePath);
        return RawObjectDataStruct.getInstance().insertTextureMap(texture);
    }

    static async loadMeshData(modelPath, lio) {
        Utility.loadJSONResource(modelPath).then(modelData => {
            if(modelData.hasOwnProperty('meshes')) {
                // this.extractVertexData(modelData['meshes'][0]).then(result => this.vertexIndex = result);
                // this.extractNormalData(modelData['meshes'][0]).then(result => this.normalIndex = result);
                // this.extractIndexData(modelData['meshes'][0]).then(result => this.indexIndex = result);
                // this.extractTextureCoordinateData(modelData['meshes'][0]).then(result => this.textureCoordinateIndex = result);
                for(let dataTypeIndex = 0; dataTypeIndex<VERTEX_DATA_FIELDS.length; dataTypeIndex++){
                    lio.dataArrays[VERTEX_DATA_TYPES[dataTypeIndex]] = ResourceLoader.extractMeshData(modelData['meshes'][0], VERTEX_DATA_FIELDS[dataTypeIndex]);
                }
            }
        });
    }

    static async extractMeshData(modelData, fieldName){
        return modelData.hasOwnProperty(fieldName) ?
            fieldName === 'faces' ? [].concat.apply([], modelData[fieldName]) :
                fieldName === 'texturecoords' ? modelData[fieldName][0] :
                    modelData[fieldName] : -1;
    }

    // async extractVertexData(modelData){
    //     if(modelData.hasOwnProperty('vertices')) {
    //         let meshData = modelData['vertices'];
    //         return meshData;
    //     }
    //     else
    //         return -1;
    // }

    // async extractNormalData(modelData) {
    //     if(modelData.hasOwnProperty('normals')) {
    //         let meshData = modelData['normals'];
    //         return RawObjectDataStruct.getInstance().insertVertexData(meshData);
    //     }
    //     else
    //         return -1;
    // }

    // async extractIndexData(modelData){
    //     if(modelData.hasOwnProperty('faces')){
    //         let meshData = [].concat.apply([], modelData['faces']);
    //         return RawObjectDataStruct.getInstance().insertVertexData(meshData);
    //     }
    //     else
    //         return -1;
    // }

    // async extractTextureCoordinateData(modelData){
    //     if(modelData.hasOwnProperty('texturecoords')){
    //         let meshData = modelData['texturecoords'][0];
    //         return RawObjectDataStruct.getInstance().insertVertexData(meshData);
    //     }
    //     else
    //         return -1;
    // }
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
