precision mediump float;

varying vec3 vertexForFrag;
varying vec3 normalForFrag;
varying vec2 texCoordForFrag;

uniform sampler2D sampler;
uniform vec3 lightPos;
uniform vec3 viewPos;

vec3 lightDirectionCalc(vec3 lightPos){
    return normalize(lightPos-vertexForFrag);
}

vec3 ambientCalc(float ambientStrength, vec3 ambientColor){
    return ambientStrength * ambientColor;
}

vec3 diffuseCalc(vec3 lightDirection, vec3 lightColor){
    float diff = max(dot(normalForFrag, lightDirection), 0.0);
    return diff * lightColor;
}

vec3 specularCalc(vec3 halfwayDir, vec3 lightColor, float shininess){
    float spec = pow(max(dot(normalForFrag, halfwayDir), 0.0), shininess);
    return spec*lightColor;
}

void main(){
    //calculate or define necessary "globals"
    vec3 lightColor = vec3(1, 1, 1);
    vec3 viewDir = normalize(viewPos-vertexForFrag);
    vec3 lightDirection = lightDirectionCalc(lightPos);
    vec3 halfwayDir = normalize(lightDirection+viewDir);
    float shininess = 32.0;

    //ambient
    vec3 ambientResult = ambientCalc(.1, lightColor);
    //diffuse
    vec3 diffuseResult = diffuseCalc(lightDirection, lightColor);
    //specular
    vec3 specularResult = specularCalc(halfwayDir, lightColor, shininess);
    //combine
    vec3 result = (ambientResult + diffuseResult + specularResult) * texture2D(sampler, texCoordForFrag).xyz;
    gl_FragColor = vec4(result, 1.0);
}

