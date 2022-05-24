import * as THREE from '../libraries/three.module.js';

function magnitude(v)
{
    var result = Math.sqrt(v.x*v.x + v.y*v.y);
    return result;
}

function normalize(v)
{

    if(v.x != 0 || v.y != 0){
    var length = magnitude(v);
    var result = new THREE.Vector2();
    result.x = v.x/length;
    result.y = v.y/length;
    }
    return result;
}

export { normalize, magnitude };