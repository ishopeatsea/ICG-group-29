import * as THREE from "../libraries/three.module.js";

var uniforms = {
    u_time: { type: 'f', value: 0.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2) },
};

var shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true
});

export { shaderMaterial };