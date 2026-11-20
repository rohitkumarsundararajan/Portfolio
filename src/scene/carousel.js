import * as THREE from 'three'
import { tiles } from '../data/content.js'
import { makeCardTexture } from '../utils/textures.js'

const CARD_W = 3.8
const CARD_H = 2.6
const SPACING = 4.2
const RADIUS = 8
const CARD_Y = -0.3

const vertexShader = /* glsl */ `
  uniform float uOffset;
  uniform float uRadius;
  uniform float uHover;
  uniform float uGrow;
  uniform vec2 uBar;
  uniform vec2 uTilt;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.xy *= mix(uBar, vec2(1.0), uGrow);
    float s = uOffset + pos.x;
    float a = s / uRadius;
    vec3 p = vec3(uRadius * sin(a), pos.y, uRadius * (cos(a) - 1.0));
    p.z += 0.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uSize;
  uniform float uBright;
  uniform float uAlpha;
  uniform float uHover;
  uniform float uGrow;
  uniform vec2 uBar;
  uniform vec2 uMouse;
  uniform float uTime;
  varying vec2 vUv;
  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }
  void main() {
    vec2 sz = uSize * mix(uBar, vec2(1.0), uGrow);
    vec2 p = (vUv - 0.5) * sz;
    float d = sdRoundBox(p, sz * 0.5, min(0.18, min(sz.x, sz.y) * 0.5));
    float mask = 1.0 - smoothstep(-0.01, 0.01, d);
    float dist = length((vUv - uMouse) * vec2(uSize.x / uSize.y, 1.0));
    float r = 0.1 * uHover;
    float on = step(0.001, uHover);
    float fall = (1.0 - smoothstep(0.0, 0.13, dist)) * uHover; fall *= fall;
    vec2 wob = vec2(sin(dist * 42.0 - uTime * 2.4 + vUv.y * 11.0), cos(dist * 38.0 - uTime * 2.1 + vUv.x * 11.0));
    vec3 tex = texture2D(uMap, vUv + wob * 0.014 * fall).rgb;
    float rim = 0.0;
    vec3 col = mix(tex, vec3(0.04), rim * 0.85);
    col = mix(vec3(1.0), col, smoothstep(0.3, 0.8, uGrow));
    float br = mix(1.0, uBright, smoothstep(0.5, 1.0, uGrow));
    gl_FragColor = vec4(col * br, mask * uAlpha);
  }
`

const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}
const wrap = (v, n) => ((((v + n / 2) % n) + n) % n) - n / 2
const clamp = (v, a, b) => Math.min(Math.max(v, a), b)

export function createCarousel({ camera, onSelect = () => {} }) {
  const group = new THREE.Group()
  group.position.y = CARD_Y
  const n = tiles.length
  const geometry = new THREE.PlaneGeometry(CARD_W, CARD_H, 40, 1)

  const cards = tiles.map((tile, i) => {
    const texture = makeCardTexture({ title: tile.title, index: i, id: tile.id })
    const mouseUv = new THREE.Vector2(0.5, 0.5)
    const tilt = new THREE.Vector2(0, 0)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: texture },
        uSize: { value: new THREE.Vector2(CARD_W, CARD_H) },
        uOffset: { value: 0 },
        uRadius: { value: RADIUS },
        uBright: { value: 1 },
        uAlpha: { value: 1 },
        uHover: { value: 0 },
        uTime: { value: 0 },
        uGrow: { value: 1 },
        uBar: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: mouseUv },
        uTilt: { value: tilt },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.frustumCulled = false
    group.add(mesh)
    return { mesh, material, texture, last: 0, hover: 0, mouseUv, tilt }
  })

  // opening animation state: the 3 home tiles (left, centre, right) grow out of bars
  const featured = n >= 3 ? [n - 1, 0, 1] : []
  const boot = { grow: {}, featAlpha: 1, others: 1 }
  let booting = false

  let progress = 0
  let velocity = 0
  let dragging = false
  let dragAccum = 0
  let lastX = 0
  let enabled = true
  let downValid = false
  let downX = 0
  let downY = 0
  let downT = 0
  let mouseX = -9999
  let mouseY = -9999

  const tmp = new THREE.Vector3()

  function cardRect(off) {
    const a = (off * SPACING) / RADIUS
    tmp.set(RADIUS * Math.sin(a), CARD_Y, RADIUS * (Math.cos(a) - 1))
    const depth = camera.position.z - tmp.z
    tmp.project(camera)
    const cx = (tmp.x * 0.5 + 0.5) * window.innerWidth
    const cy = (-tmp.y * 0.5 + 0.5) * window.innerHeight
    const ppu =
      window.innerHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * depth)
    return { cx, cy, hw: CARD_W * 0.5 * Math.cos(a) * ppu, hh: CARD_H * 0.5 * ppu }
  }

  function prepareBoot(barW, barH) {
    camera.updateMatrixWorld(true)
    featured.forEach((idx, k) => {
      const r = cardRect(k - 1)
      cards[idx].material.uniforms.uBar.value.set(barW / 2 / r.hw, barH / 2 / r.hh)
      boot.grow[idx] = 0
    })
    boot.featAlpha = 0
    boot.others = 0
    booting = true
  }

  function endBoot() {
    featured.forEach((idx) => (boot.grow[idx] = 1))
    boot.featAlpha = 1
    boot.others = 1
    booting = false
  }

  function hitTest(x, y) {
    let best = null
    for (let i = 0; i < n; i++) {
      const off = wrap(i - progress, n)
      if (Math.abs(off) > 2.2) continue
      const rect = cardRect(off)
      if (Math.abs(x - rect.cx) < rect.hw && Math.abs(y - rect.cy) < rect.hh) {
        if (!best || Math.abs(off) < Math.abs(best.off)) best = { index: i, off, rect }
      }
    }
    return best
  }

  function getActiveIndex() {
    return ((Math.round(progress) % n) + n) % n
  }

  function nudge(dir) {
    velocity = dir * 0.07
  }

  function setEnabled(value) {
    enabled = value
    if (!value) {
      dragging = false
      downValid = false
    }
  }

  function handleClick(x, y) {
    const hit = hitTest(x, y)
    if (hit) {
      if (Math.abs(hit.off) < 0.5) onSelect(hit.index)
      else nudge(hit.off > 0 ? 1 : -1)
      return
    }
    const r = cardRect(0)
    if (Math.abs(y - r.cy) < r.hh * 1.2) nudge(x < r.cx ? -1 : 1)
  }

  window.addEventListener(
    'wheel',
    (e) => {
      if (!enabled) return
      velocity += (e.deltaY + e.deltaX) * 0.0006
      velocity = Math.max(-0.5, Math.min(0.5, velocity))
    },
    { passive: true }
  )
  window.addEventListener('pointerdown', (e) => {
    if (!enabled || e.target.closest('button, a, .panel, .contact')) {
      downValid = false
      return
    }
    downValid = true
    dragging = true
    lastX = e.clientX
    downX = e.clientX
    downY = e.clientY
    downT = performance.now()
    velocity = 0
  })
  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
    if (!dragging) return
    dragAccum -= (e.clientX - lastX) * 0.006
    lastX = e.clientX
  })
  document.documentElement.addEventListener('mouseleave', () => {
    mouseX = -9999
    mouseY = -9999
  })
  window.addEventListener('pointerup', (e) => {
    dragging = false
    if (!downValid) return
    downValid = false
    const moved = Math.hypot(e.clientX - downX, e.clientY - downY)
    if (moved < 6 && performance.now() - downT < 500) handleClick(e.clientX, e.clientY)
  })
  window.addEventListener('pointercancel', () => {
    dragging = false
    downValid = false
  })

  const ANIM_FRAME_MS = 1000 / 24
  const ANIM_BUDGET = 2
  const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function animate() {
    if ((!enabled && !booting) || REDUCE_MOTION) return
    const now = performance.now()
    const due = cards.filter((c, i) => Math.abs(wrap(i - progress, n)) < 2.7 && now - c.last >= ANIM_FRAME_MS)
    due.sort((a, b) => a.last - b.last)
    due.slice(0, ANIM_BUDGET).forEach((c) => {
      c.last = now
      c.texture.userData.render(now / 1000)
    })
  }

  function update(dt) {
    animate()
    const k = dt * 60
    if (dragging) {
      progress += dragAccum
      velocity += (dragAccum - velocity) * 0.35
      dragAccum = 0
    } else {
      progress += velocity * k
      velocity *= Math.pow(0.93, k)
      if (Math.abs(velocity) < 0.005) {
        progress += (Math.round(progress) - progress) * (1 - Math.pow(0.9, k))
      }
    }

    const hit = enabled && !dragging && mouseX > -1000 ? hitTest(mouseX, mouseY) : null
    document.body.style.cursor = !enabled ? 'default' : hit ? 'pointer' : dragging ? 'grabbing' : 'grab'
    const ease = 1 - Math.exp(-dt * 9)
    const follow = 1 - Math.exp(-dt * 14)

    cards.forEach((card, i) => {
      const off = wrap(i - progress, n)
      const abs = Math.abs(off)
      const isHit = hit && hit.index === i
      card.hover += ((isHit ? 1 : 0) - card.hover) * ease

      if (isHit) {
        const { cx, cy, hw, hh } = hit.rect
        const tu = (mouseX - (cx - hw)) / (2 * hw)
        const tv = 1 - (mouseY - (cy - hh)) / (2 * hh)
        if (card.hover < 0.05) {
          card.mouseUv.set(tu, tv)
        } else {
          card.mouseUv.set(
            card.mouseUv.x + (tu - card.mouseUv.x) * follow,
            card.mouseUv.y + (tv - card.mouseUv.y) * follow
          )
        }
        card.tilt.set(clamp((mouseX - cx) / hw, -1, 1), clamp(-(mouseY - cy) / hh, -1, 1))
      }

      const feat = featured.indexOf(i) >= 0
      const u = card.material.uniforms
      const bright = 0.35 + 0.65 * (1 - smooth(0, 1.3, abs))
      u.uOffset.value = off * SPACING
      u.uBright.value = bright
      u.uAlpha.value = (1 - smooth(2.1, 2.9, abs)) * (feat ? boot.featAlpha : boot.others)
      u.uGrow.value = feat && boot.grow[i] !== undefined ? boot.grow[i] : 1
      u.uHover.value = card.hover
      u.uTime.value = performance.now() / 1000
    })
  }

  return { group, update, getActiveIndex, nudge, setEnabled, cardRect, prepareBoot, endBoot, boot, featured }
}