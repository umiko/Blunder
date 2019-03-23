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

    static createMapFromArrays(key, value){
        if(key.length !== value.length)
            console.error("Cant create map with different length arrays");
        let myMap = new Map();
        for(let i = 0; i<key.length; i++)
            myMap.set(key[i], value[i]);
        return myMap;
    }
}