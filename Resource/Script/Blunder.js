function main(){
    var time = Date.now();
    ResourceLoader.loadResources().then(result =>{
        Blunder.getInstance().initializeWebGL();
        DrawableObjectInitializer.initializeResources(result);
        Blunder.getInstance().renderingLoop();
    });
}

const TEXTURE_MAP_TYPES = ['diffuse', 'normal', 'specular', 'gloss'];
const JSON_VERTEX_DATA_FIELDS = ['vertices', 'normals', 'faces', 'texturecoords'];
const VERTEX_DATA_TYPES = ['vertex', 'normal', 'textureCoordinate', 'index'];
const VERTEX_DATA_CORRESPONDING_BUFFER_TYPES = function(){
    let ctxTemp = Blunder.getWebGLContext();
    return [ctxTemp.ARRAY_BUFFER, ctxTemp.ARRAY_BUFFER, ctxTemp.ARRAY_BUFFER, ctxTemp.ELEMENT_ARRAY_BUFFER];
}

class Blunder{

    constructor(){
        this.canvas = document.getElementById('viewport');
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

    static insertTextureMap(texture){
        if(this.getInstance().textureBuffer.includes(texture)){
            return this.getInstance().textureBuffer.indexOf(texture);
        }
        else{
            return this.getInstance().textureBuffer.push(texture)-1;
        }
    }

    static getTextureMap(textureIndex){
        return this.getInstance().textureBuffer[textureIndex];
    }

    static insertShader(shader){
        if(this.getInstance().shaderPrograms.includes(shader)){
            return this.getInstance().shaderPrograms.indexOf(shader);
        }
        else{
            return this.getInstance().shaderPrograms.push(shader)-1;
        }
    }

    static getShader(shaderIndex){
        return this.getInstance().shaderPrograms[shaderIndex];
    }

    static insertVertexData(dataArray){
        if(this.getInstance().vertexBuffer.includes(dataArray)){
            return this.getInstance().vertexBuffer.indexOf(dataArray);
        }
        else{
            return this.getInstance().vertexBuffer.push(dataArray)-1;
        }
    }

    static getVertexData(meshIndex){
        return this.getInstance().vertexBuffer[meshIndex];
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
        this.bufferIndices = {
            vertexBufferIndex : null,
            normalBufferIndex : null,
            indexBufferIndex : null,
            textureCoordinateBufferIndex :null
        };
        this.shaderProgramIndex = null;
    }
}

class DrawableObjectInitializer{

    static initializeResources(rodsArray){
        for(let rods in rodsArray){
            DrawableObjectInitializer.initializeDrawableObject(rodsArray[rods]);
        }
    }

    static initializeDrawableObject(rods){
        let drawableObject = new DrawableObject();
        //todo: compile shaders, initialize buffers
        drawableObject.shaderProgramIndex = DrawableObjectInitializer.initializeShader(rods);
        DrawableObjectInitializer.initializeBuffers(rods, drawableObject);
        console.log(drawableObject);
        return drawableObject;
    }

    static initializeShader(rods){
        let context = Blunder.getWebGLContext();
        let shader = ShaderHelper.createShaderProgram(context, rods.getVertexShaderCode(), rods.getFragmentShaderCode());
        
        return BufferObjectStruct.insertShader(shader);
    }

    static initializeBuffers(rods, drawableObject) {
        DrawableObjectInitializer.initializeVertexDataBuffers(rods, drawableObject);
        //initializeTextureBuffers();
    }

    static initializeVertexDataBuffers(rods, drawableObject) {
        let VERTEX_DATA_BUFFER_TYPE_MAPPING = Utility.createMapFromArrays(VERTEX_DATA_TYPES, VERTEX_DATA_CORRESPONDING_BUFFER_TYPES());
        for(let perVertexDataType in VERTEX_DATA_TYPES){
            if(rods.dataArrays.hasOwnProperty(VERTEX_DATA_TYPES[perVertexDataType])){
                let buffer = DrawableObjectInitializer.initializeBuffer(Blunder.getWebGLContext(), VERTEX_DATA_BUFFER_TYPE_MAPPING.get(VERTEX_DATA_TYPES[perVertexDataType]), rods.dataArrays[VERTEX_DATA_TYPES[perVertexDataType]]);
                drawableObject.bufferIndices[VERTEX_DATA_TYPES[perVertexDataType]+"BufferIndex"] = buffer === -1 ? -1 : BufferObjectStruct.insertVertexData(buffer);
            }
        }
    }

    static initializeBuffer(context, bufferTypeEnum, data){
        console.log(data);
        if(data !== -1){
            let buffer = context.createBuffer();
            context.bindBuffer(bufferTypeEnum, buffer);
            context.bufferData(bufferTypeEnum, data, context.STATIC_DRAW);
            context.bindBuffer(bufferTypeEnum, null);
            return buffer;
        }
        return -1;
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
            return vertexDataObject;
        });
    }

    static extractMeshData(modelData, fieldName){
        return modelData.hasOwnProperty(fieldName) ?
            fieldName === 'faces' ? new Uint16Array([].concat.apply([], modelData[fieldName])) :
                fieldName === 'texturecoords' ? new Float32Array(modelData[fieldName][0]) :
                new Float32Array(modelData[fieldName]) : new Float32Array(modelData['vertices'].length).fill(0.0);
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