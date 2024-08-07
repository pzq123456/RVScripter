function uuid(){
    return Math.random().toString(36).substring(2, 15) + 
            Math.random().toString(36).substring(2, 15);
}

function stringfyColor(color){
    if(color instanceof Array){
        return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }
    return color;
}

function mixColor(color1, color2, ratio = 0.5){
    let c1 = parseColor(color1);
    let c2 = parseColor(color2);
    return [
        c1[0] * ratio + c2[0] * (1 - ratio),
        c1[1] * ratio + c2[1] * (1 - ratio),
        c1[2] * ratio + c2[2] * (1 - ratio)
    ];
}

function parseColor(color){
    if(color.startsWith("rgb")){
        return color.match(/\d+/g).map(Number);
    }else if(color.startsWith("#")){
        return [
            parseInt(color.slice(1, 3), 16),
            parseInt(color.slice(3, 5), 16),
            parseInt(color.slice(5, 7), 16)
        ];
    }else if(color.startsWith("hsl")){
        return color.match(/\d+/g).map(Number);
    }
    return color;
}