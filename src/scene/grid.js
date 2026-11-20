import * as THREE from 'three'

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(p.x * 0.6 + uTime * 0.8) * 0.04
         + sin(p.y * 0.5 - uTime * 0.6) * 0.04;
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vec2 g = vUv * 60.0;
    vec2 grid = abs(fract(g - 0.5) - 0.5) / fwidth(g);
    float line = 1.0 - min(min(grid.x, grid.y), 1.0);
    float fade = 1.0 - smoothstep(4.0, 28.0, length(vWorld.xz - cameraPosition.xz));
    gl_FragColor = vec4(vec3(1.0), line * fade * 0.18);
  }
`

export function createGrid() {
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
  })

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(60, 60, 120, 120), material)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = -2.0

  return {
    mesh,
    update(time) {
      material.uniforms.uTime.value = time
    },
  }
}

