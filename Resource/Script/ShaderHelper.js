class ShaderHelper{

    static createShaderProgram(context, vertexCode, fragmentCode){
        let vertexShader = ShaderHelper.compileShader(context, vertexCode, context.VERTEX_SHADER);
        let fragmentShader = ShaderHelper.compileShader(context, fragmentCode, context.FRAGMENT_SHADER);
        let shaderProgram = ShaderHelper.linkShaderProgram(context, vertexShader, fragmentShader);
        ShaderHelper.validateShaderProgram(context, shaderProgram);
        return shaderProgram;
    }

    static compileShader(context, shaderCode, shaderType){
        let compiledShader = context.createShader(shaderType);
        context.shaderSource(compiledShader, shaderCode);
        context.compileShader(compiledShader);
        ShaderHelper.checkShaderCompilationStatus(context, compiledShader);
        return compiledShader;
    }

    static linkShaderProgram(context, vertexShader, fragmentShader){
        let shaderProgram = context.createProgram();
        context.attachShader(shaderProgram, vertexShader);
        context.attachShader(shaderProgram, fragmentShader);
        context.linkProgram(shaderProgram);
        ShaderHelper.checkProgramLinkStatus(context, shaderProgram);
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
        context.validateProgram(shaderProgram);
        if(!context.getProgramParameter(shaderProgram, context.VALIDATE_STATUS)){
            throw new Error("Error validating program!\n" + context.getProgramInfoLog(shaderProgram));
        }
    }
}
