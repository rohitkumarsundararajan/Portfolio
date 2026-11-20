import * as THREE from 'three'
import { gsap } from 'gsap'

const RING_Z = 3
const RING_Y = -0.05
const TORUS_R = 0.95
const TUBE = 0.07

const vertexShader = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalV = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uScene;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  void main() {
    vec3 n = normalize(vNormalV);
    vec3 v = normalize(vViewDir);
    float fres = pow(1.0 - max(dot(n, v), 0.0), 2.5);
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 off = n.xy * (0.10 + 0.18 * fres);
    float r = texture2D(uScene, uv + off * 0.90).r;
    float g = texture2D(uScene, uv + off * 1.00).g;
    float b = texture2D(uScene, uv + off * 1.12).b;
    vec3 refr = vec3(r, g, b);
    float band = smoothstep(-0.3, 0.9, n.y * 0.75 + n.x * 0.35);
    vec3 chrome = mix(vec3(0.04), vec3(0.95), band);
    vec3 irid = 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + fres * 0.8 + n.x * 0.35 + uTime * 0.04));
    vec3 env = mix(chrome, irid, 0.45);
    vec3 col = mix(refr, env, 0.55 + 0.4 * fres);
    gl_FragColor = vec4(col, uOpacity);
  }
`

export function createRing({ camera }) {
  const group = new THREE.Group()
  group.position.set(0, RING_Y, RING_Z)
  group.visible = false
  group.scale.setScalar(0.2)

  const rt = new THREE.WebGLRenderTarget(2, 2)
  const ringMat = new THREE.ShaderMaterial({
    uniforms: {
      uScene: { value: rt.texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
  })
  const ring = new THREE.Mesh(new THREE.TorusGeometry(TORUS_R, TUBE, 64, 160), ringMat)

  const discMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 })
  const disc = new THREE.Mesh(new THREE.CircleGeometry(TORUS_R - TUBE + 0.05, 96), discMat)

  group.add(disc, ring)

  let active = false

  function halfHeight() {
    return Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - RING_Z)
  }

  function computeScale() {
    const halfH = halfHeight()
    const halfW = halfH * camera.aspect
    const outer = TORUS_R + TUBE
    return Math.min((0.84 * halfH) / outer, (0.9 * halfW) / outer)
  }

  function getHoleDiameterPx() {
    const pxPerUnit = window.innerHeight / (2 * halfHeight())
    return 2 * (TORUS_R - TUBE) * computeScale() * pxPerUnit
  }

  function resize(renderer) {
    const v = new THREE.Vector2()
    renderer.getDrawingBufferSize(v)
    rt.setSize(v.x, v.y)
    ringMat.uniforms.uResolution.value.copy(v)
  }

  function show() {
    active = true
    group.visible = true
    const s = computeScale()
    gsap.killTweensOf([group.scale, ringMat.uniforms.uOpacity, discMat])
    gsap.fromTo(
      group.scale,
      { x: s * 0.25, y: s * 0.25, z: s * 0.25 },
      { x: s, y: s, z: s, duration: 1.1, ease: 'expo.out' }
    )
    gsap.to(ringMat.uniforms.uOpacity, { value: 1, duration: 0.5 })
    gsap.to(discMat, { opacity: 1, duration: 0.5 })
  }

  function hide() {
    const s = group.scale.x * 0.25
    gsap.killTweensOf([group.scale, ringMat.uniforms.uOpacity, discMat])
    gsap.to(group.scale, { x: s, y: s, z: s, duration: 0.45, ease: 'power3.in' })
    gsap.to(discMat, { opacity: 0, duration: 0.45 })
    gsap.to(ringMat.uniforms.uOpacity, {
      value: 0,
      duration: 0.45,
      onComplete: () => {
        group.visible = false
        active = false
      },
    })
  }

  function update(t, mouse) {
    if (!group.visible) return
    ringMat.uniforms.uTime.value = t
    group.rotation.x = Math.sin(t * 0.6) * 0.08 - mouse.y * 0.18
    group.rotation.y = Math.cos(t * 0.5) * 0.12 + mouse.x * 0.25
  }

  function renderBackground(renderer, scene, cam) {
    group.visible = false
    renderer.setRenderTarget(rt)
    renderer.render(scene, cam)
    renderer.setRenderTarget(null)
    group.visible = true
  }

  return {
    group,
    show,
    hide,
    update,
    resize,
    renderBackground,
    getHoleDiameterPx,
    isActive: () => active,
  }
}