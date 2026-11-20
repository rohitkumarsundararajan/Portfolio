import * as THREE from 'three'

const W = 1024
const H = 704
const RS = 0.875
const RW = Math.round(W * RS)
const RH = Math.round(H * RS)
const INK = '#0a0a0a'
const LOOP = 5
const TAU = Math.PI * 2

const clamp01 = (x) => Math.min(Math.max(x, 0), 1)
const lerp = (a, b, k) => a + (b - a) * k
const seg = (p, a, b) => clamp01((p - a) / (b - a))
const ease = (x) => {
  const k = clamp01(x)
  return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
}
const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3)
const easeBack = (x) => {
  const k = clamp01(x)
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2)
}
const fadeOut = (p, from, to) => 1 - ease(seg(p, from, to))

function star(g, cx, cy, R, r, rot) {
  g.beginPath()
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r : R
    const ang = rot - Math.PI / 2 + (i * Math.PI) / 5
    const x = cx + Math.cos(ang) * rad
    const y = cy + Math.sin(ang) * rad
    if (i) g.lineTo(x, y)
    else g.moveTo(x, y)
  }
  g.closePath()
}

function diamond(g, x, y, r) {
  g.beginPath()
  g.moveTo(x, y - r)
  g.lineTo(x + r * 0.45, y)
  g.lineTo(x, y + r)
  g.lineTo(x - r * 0.45, y)
  g.closePath()
}

// ---------- Projects: rotating cube + growing bars ----------
function projects(g, p) {
  const a = p * TAU
  const b = 0.55 + 0.25 * Math.sin(a)
  const cx = 600
  const cy = 275
  const s = 75
  const V = []
  for (let i = 0; i < 8; i++) {
    const x = i & 1 ? 1 : -1
    const y = i & 2 ? 1 : -1
    const z = i & 4 ? 1 : -1
    const x1 = x * Math.cos(a) + z * Math.sin(a)
    const z1 = -x * Math.sin(a) + z * Math.cos(a)
    const y1 = y * Math.cos(b) - z1 * Math.sin(b)
    const z2 = y * Math.sin(b) + z1 * Math.cos(b)
    const f = 4.5 / (4.5 - z2)
    V.push({ x: cx + x1 * s * f, y: cy + y1 * s * f, near: clamp01((z2 + 1.7) / 3.4) })
  }
  const E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]]
  const edges = E.map(([i, j]) => ({ i, j, n: (V[i].near + V[j].near) / 2 })).sort((u, v) => u.n - v.n)
  g.lineCap = 'round'
  edges.forEach(({ i, j, n }) => {
    g.globalAlpha = 0.3 + 0.7 * n
    g.strokeStyle = n > 0.5 ? '#7c3aed' : '#06b6d4'
    g.lineWidth = 3 + 3 * n
    g.beginPath()
    g.moveTo(V[i].x, V[i].y)
    g.lineTo(V[j].x, V[j].y)
    g.stroke()
  })
  g.globalAlpha = 1
  V.forEach((v) => {
    g.fillStyle = '#ec4899'
    g.beginPath()
    g.arc(v.x, v.y, 4 + 4 * v.near, 0, TAU)
    g.fill()
  })

  const base = 440
  g.strokeStyle = 'rgba(10,10,10,0.22)'
  g.lineWidth = 3
  g.beginPath()
  g.moveTo(770, base + 8)
  g.lineTo(984, base + 8)
  g.stroke()
  const cols = [['#8b5cf6', '#6366f1'], ['#6366f1', '#0ea5e9'], ['#0ea5e9', '#06b6d4'], ['#ec4899', '#f97316']]
  const targets = [100, 150, 120, 200]
  const tops = []
  cols.forEach((c, i) => {
    const h = targets[i] * (0.62 + 0.38 * Math.sin(a + i * 0.9 - 1))
    const x = 790 + i * 50
    const gr = g.createLinearGradient(0, base - h, 0, base)
    gr.addColorStop(0, c[0])
    gr.addColorStop(1, c[1])
    g.fillStyle = gr
    g.beginPath()
    g.roundRect(x, base - h, 34, h, 10)
    g.fill()
    tops.push([x + 17, base - h - 18])
  })
  g.strokeStyle = '#f43f5e'
  g.lineWidth = 3.5
  g.lineJoin = 'round'
  g.beginPath()
  tops.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
  g.stroke()
  tops.forEach(([x, y]) => {
    g.fillStyle = '#fff'
    g.lineWidth = 3
    g.beginPath()
    g.arc(x, y, 6, 0, TAU)
    g.fill()
    g.stroke()
  })
}

// ---------- Internships: page being built + booking tick ----------
function internships(g, p) {
  const out = fadeOut(p, 0.9, 0.98)
  g.fillStyle = '#ffffff'
  g.strokeStyle = '#fdba74'
  g.lineWidth = 3
  g.beginPath()
  g.roundRect(430, 80, 540, 400, 22)
  g.fill()
  g.stroke()
  g.fillStyle = '#fff7ed'
  g.beginPath()
  g.roundRect(431, 81, 538, 46, [21, 21, 0, 0])
  g.fill()
  ;[['#fb7185', 462], ['#fbbf24', 486], ['#34d399', 510]].forEach(([c, x]) => {
    g.fillStyle = c
    g.beginPath()
    g.arc(x, 104, 7, 0, TAU)
    g.fill()
  })
  g.fillStyle = '#ffedd5'
  g.beginPath()
  g.roundRect(545, 91, 400, 26, 13)
  g.fill()

  const block = (start, fn) => {
    const k = easeOut(seg(p, start, start + 0.1)) * out
    if (k <= 0.01) return
    g.save()
    g.globalAlpha = k
    g.translate(0, (1 - k) * 28)
    fn()
    g.restore()
  }
  block(0.06, () => {
    const gr = g.createLinearGradient(452, 0, 948, 0)
    gr.addColorStop(0, '#f97316')
    gr.addColorStop(1, '#ec4899')
    g.fillStyle = gr
    g.beginPath()
    g.roundRect(452, 146, 496, 92, 16)
    g.fill()
    g.fillStyle = 'rgba(255,255,255,0.9)'
    g.beginPath()
    g.roundRect(478, 172, 200, 16, 8)
    g.fill()
    g.fillStyle = 'rgba(255,255,255,0.6)'
    g.beginPath()
    g.roundRect(478, 200, 130, 12, 6)
    g.fill()
  })
  const card = (x, icon) => () => {
    g.fillStyle = '#fff7ed'
    g.strokeStyle = '#fdba74'
    g.lineWidth = 2
    g.beginPath()
    g.roundRect(x, 256, 240, 120, 16)
    g.fill()
    g.stroke()
    g.fillStyle = icon
    g.beginPath()
    g.arc(x + 34, 292, 18, 0, TAU)
    g.fill()
    g.fillStyle = '#fed7aa'
    g.beginPath()
    g.roundRect(x + 68, 286, 140, 12, 6)
    g.fill()
    g.fillStyle = '#ffedd5'
    g.beginPath()
    g.roundRect(x + 22, 328, 190, 10, 5)
    g.fill()
    g.beginPath()
    g.roundRect(x + 22, 348, 130, 10, 5)
    g.fill()
  }
  block(0.18, card(452, '#fb923c'))
  block(0.28, card(708, '#ec4899'))
  ;[[0.38, 396, 380, '#fed7aa'], [0.44, 420, 300, '#ffe4cc'], [0.5, 444, 190, '#ffedd5']].forEach(([s, y, w, c]) =>
    block(s, () => {
      g.fillStyle = c
      g.beginPath()
      g.roundRect(452, y, w, 12, 6)
      g.fill()
    })
  )

  const bp = easeBack(seg(p, 0.62, 0.74)) * out
  if (bp > 0.02) {
    g.save()
    g.translate(905, 440)
    g.scale(bp, bp)
    g.fillStyle = '#ffffff'
    g.strokeStyle = '#10b981'
    g.lineWidth = 4
    g.beginPath()
    g.roundRect(-48, -48, 96, 96, 20)
    g.fill()
    g.stroke()
    g.fillStyle = '#10b981'
    g.beginPath()
    g.roundRect(-48, -48, 96, 28, [20, 20, 0, 0])
    g.fill()
    const tk = seg(p, 0.7, 0.8)
    const t1 = clamp01(tk / 0.4)
    const t2 = clamp01((tk - 0.4) / 0.6)
    g.strokeStyle = '#10b981'
    g.lineWidth = 8
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.beginPath()
    g.moveTo(-20, 10)
    g.lineTo(lerp(-20, -6, t1), lerp(10, 24, t1))
    if (t2 > 0) g.lineTo(lerp(-6, 22, t2), lerp(24, -6, t2))
    g.stroke()
    g.restore()
  }
}

// ---------- Achievements: podium + star burst ----------
function achievements(g, p) {
  const out = fadeOut(p, 0.9, 0.98)
  const base = 470
  g.strokeStyle = 'rgba(10,10,10,0.18)'
  g.lineWidth = 3
  g.beginPath()
  g.moveTo(470, base + 3)
  g.lineTo(930, base + 3)
  g.stroke()

  const bars = [
    { x: 500, w: 120, h: 130, start: 0.14, c: ['#38bdf8', '#6366f1'], n: '2' },
    { x: 640, w: 120, h: 190, start: 0.24, c: ['#fde047', '#f59e0b'], n: '1' },
    { x: 780, w: 120, h: 100, start: 0.06, c: ['#fb923c', '#ea580c'], n: '3' },
  ]
  bars.forEach((b) => {
    const k = easeBack(seg(p, b.start, b.start + 0.2))
    const h = b.h * k * out
    if (h < 2) return
    const gr = g.createLinearGradient(0, base - h, 0, base)
    gr.addColorStop(0, b.c[0])
    gr.addColorStop(1, b.c[1])
    g.fillStyle = gr
    g.beginPath()
    g.roundRect(b.x, base - h, b.w, h, [14, 14, 0, 0])
    g.fill()
    if (h > 60) {
      g.fillStyle = 'rgba(255,255,255,0.95)'
      g.font = '700 54px Arial, sans-serif'
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.fillText(b.n, b.x + b.w / 2, base - h + 48)
    }
  })

  const sp = easeBack(seg(p, 0.46, 0.6)) * out
  if (sp > 0.02) {
    const cy = 205 + Math.sin(p * TAU * 2) * 4
    const pulse = 1 + 0.06 * Math.sin(p * TAU * 3)
    g.save()
    g.translate(700, cy)
    g.scale(sp * pulse, sp * pulse)
    g.rotate((1 - sp) * 1.2)
    const gr = g.createLinearGradient(0, -54, 0, 54)
    gr.addColorStop(0, '#fde047')
    gr.addColorStop(1, '#f59e0b')
    g.fillStyle = gr
    g.strokeStyle = '#f59e0b'
    g.lineWidth = 4
    g.lineJoin = 'round'
    star(g, 0, 0, 54, 24, 0)
    g.fill()
    g.stroke()
    g.restore()

    const rb = seg(p, 0.5, 0.7)
    if (rb > 0 && rb < 1) {
      g.lineCap = 'round'
      g.lineWidth = 5
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * TAU
        const r1 = 70 + 60 * easeOut(rb)
        const r2 = r1 + 26 * (1 - rb)
        g.globalAlpha = (1 - rb) * out
        g.strokeStyle = i % 2 ? '#fb7185' : '#f59e0b'
        g.beginPath()
        g.moveTo(700 + Math.cos(ang) * r1, cy + Math.sin(ang) * r1)
        g.lineTo(700 + Math.cos(ang) * r2, cy + Math.sin(ang) * r2)
        g.stroke()
      }
      g.globalAlpha = 1
    }
  }
  if (sp > 0.8) {
    const spark = [[540, 170, '#ec4899'], [900, 190, '#06b6d4'], [570, 300, '#f59e0b'], [880, 285, '#8b5cf6'], [790, 120, '#f59e0b'], [610, 115, '#06b6d4']]
    spark.forEach(([x, y, c], i) => {
      const tw = 0.5 + 0.5 * Math.sin(p * TAU * 2 + i * 1.1)
      g.globalAlpha = sp * (0.35 + 0.65 * tw)
      g.fillStyle = c
      diamond(g, x, y, 8 + 10 * tw)
      g.fill()
    })
    g.globalAlpha = 1
  }
}

// ---------- Competitive Programming: rating graph + typing code ----------
const CP_PTS = [0.88, 0.74, 0.8, 0.58, 0.64, 0.42, 0.5, 0.26, 0.32, 0.1]
const CODE = [
  { indent: 0, parts: [['#ec4899', 60], ['#94a3b8', 120], ['#6366f1', 90]] },
  { indent: 28, parts: [['#f59e0b', 80], ['#0ea5e9', 150], ['#94a3b8', 70]] },
  { indent: 28, parts: [['#22c55e', 100], ['#ec4899', 70], ['#0ea5e9', 130]] },
  { indent: 0, parts: [['#6366f1', 70], ['#94a3b8', 140]] },
]

function cp(g, p) {
  const out = fadeOut(p, 0.93, 0.99)
  const gx = 420
  const gy = 140
  const gw = 560
  const gh = 200
  g.globalAlpha = out
  g.strokeStyle = 'rgba(10,10,10,0.08)'
  g.lineWidth = 2
  for (let i = 0; i <= 4; i++) {
    const y = gy + (gh * i) / 4
    g.beginPath()
    g.moveTo(gx, y)
    g.lineTo(gx + gw, y)
    g.stroke()
  }
  const draw = ease(seg(p, 0.04, 0.58))
  const n = CP_PTS.length - 1
  const pts = CP_PTS.map((v, i) => [gx + (gw * i) / n, gy + gh * v])
  const f = draw * n
  const whole = Math.min(Math.floor(f), n)
  const frac = f - whole
  const path = []
  for (let i = 0; i <= whole; i++) path.push(pts[i])
  if (whole < n) path.push([lerp(pts[whole][0], pts[whole + 1][0], frac), lerp(pts[whole][1], pts[whole + 1][1], frac)])

  if (path.length > 1) {
    const fillG = g.createLinearGradient(0, gy, 0, gy + gh)
    fillG.addColorStop(0, 'rgba(34,197,94,0.35)')
    fillG.addColorStop(1, 'rgba(34,197,94,0)')
    g.fillStyle = fillG
    g.beginPath()
    g.moveTo(path[0][0], gy + gh)
    path.forEach(([x, y]) => g.lineTo(x, y))
    g.lineTo(path[path.length - 1][0], gy + gh)
    g.closePath()
    g.fill()

    const lineG = g.createLinearGradient(gx, 0, gx + gw, 0)
    lineG.addColorStop(0, '#22c55e')
    lineG.addColorStop(0.5, '#06b6d4')
    lineG.addColorStop(1, '#6366f1')
    g.strokeStyle = lineG
    g.lineWidth = 6
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.beginPath()
    path.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
    g.stroke()
  }
  for (let i = 0; i <= whole; i++) {
    if (i === n && draw < 1) continue
    g.fillStyle = '#fff'
    g.strokeStyle = '#22c55e'
    g.lineWidth = 4
    g.beginPath()
    g.arc(pts[i][0], pts[i][1], 8, 0, TAU)
    g.fill()
    g.stroke()
  }
  if (draw > 0 && draw < 1) {
    const head = path[path.length - 1]
    g.fillStyle = '#06b6d4'
    g.beginPath()
    g.arc(head[0], head[1], 11, 0, TAU)
    g.fill()
    g.globalAlpha = out * 0.3
    g.beginPath()
    g.arc(head[0], head[1], 11 + 8 * (0.5 + 0.5 * Math.sin(p * TAU * 12)), 0, TAU)
    g.fill()
    g.globalAlpha = out
  }

  g.fillStyle = '#16a34a'
  g.font = '700 52px Arial, sans-serif'
  g.textAlign = 'left'
  g.textBaseline = 'alphabetic'
  g.fillText(String(Math.round(lerp(1490, 1834, draw))), gx, 108)
  g.fillStyle = 'rgba(10,10,10,0.5)'
  g.font = '500 18px Arial, sans-serif'
  g.fillText('RATING', gx + 136, 108)

  CODE.forEach((line, i) => {
    const y = 386 + i * 34
    const x0 = gx + line.indent
    const total = line.parts.reduce((s, part) => s + part[1] + 10, 0) - 10
    const start = 0.5 + i * 0.09
    const r = seg(p, start, start + 0.09)
    if (r <= 0) return
    g.save()
    g.beginPath()
    g.rect(x0 - 2, y - 8, total * r + 4, 26)
    g.clip()
    let x = x0
    line.parts.forEach(([c, w]) => {
      g.fillStyle = c
      g.beginPath()
      g.roundRect(x, y, w, 14, 7)
      g.fill()
      x += w + 10
    })
    g.restore()
    const typing = r < 1
    const idle = i === CODE.length - 1 && p < 0.93 && Math.sin(p * TAU * 10) > 0
    if (typing || idle) {
      g.fillStyle = '#0f172a'
      g.fillRect(x0 + total * r + 5, y - 4, 3, 22)
    }
  })
  g.globalAlpha = 1
}

// ---------- Tech Stacks: stacked slabs + orbiting nodes ----------
function slab(g, cx, cy, w, h, th, top, left, right) {
  g.fillStyle = left
  g.beginPath()
  g.moveTo(cx - w / 2, cy)
  g.lineTo(cx, cy + h / 2)
  g.lineTo(cx, cy + h / 2 + th)
  g.lineTo(cx - w / 2, cy + th)
  g.closePath()
  g.fill()
  g.fillStyle = right
  g.beginPath()
  g.moveTo(cx + w / 2, cy)
  g.lineTo(cx, cy + h / 2)
  g.lineTo(cx, cy + h / 2 + th)
  g.lineTo(cx + w / 2, cy + th)
  g.closePath()
  g.fill()
  g.fillStyle = top
  g.beginPath()
  g.moveTo(cx, cy - h / 2)
  g.lineTo(cx + w / 2, cy)
  g.lineTo(cx, cy + h / 2)
  g.lineTo(cx - w / 2, cy)
  g.closePath()
  g.fill()
  g.strokeStyle = 'rgba(255,255,255,0.6)'
  g.lineWidth = 2
  g.stroke()
}

function stacks(g, p) {
  const a = p * TAU
  const cx = 700
  const oy = 270
  const rx = 265
  const ry = 95
  const colors = ['#ec4899', '#f59e0b', '#8b5cf6', '#0ea5e9', '#84cc16']
  const nodes = colors.map((c, i) => {
    const ang = a + (i * TAU) / colors.length
    return { x: cx + rx * Math.cos(ang), y: oy + ry * Math.sin(ang), d: Math.sin(ang), c }
  })

  g.strokeStyle = 'rgba(10,10,10,0.12)'
  g.lineWidth = 2
  g.setLineDash([6, 10])
  g.beginPath()
  g.ellipse(cx, oy, rx, ry, 0, 0, TAU)
  g.stroke()
  g.setLineDash([])
  g.strokeStyle = 'rgba(99,102,241,0.35)'
  g.lineWidth = 2
  g.beginPath()
  nodes.forEach((n, i) => (i ? g.lineTo(n.x, n.y) : g.moveTo(n.x, n.y)))
  g.closePath()
  g.stroke()

  const drawNode = (n) => {
    g.globalAlpha = n.d < 0 ? 0.7 : 1
    g.fillStyle = n.c
    g.strokeStyle = '#fff'
    g.lineWidth = 3
    g.beginPath()
    g.arc(n.x, n.y, 13 + 4 * n.d, 0, TAU)
    g.fill()
    g.stroke()
    g.globalAlpha = 1
  }
  nodes.filter((n) => n.d < 0).forEach(drawNode)

  const layers = [
    { y: 330, top: '#34d399', left: '#059669', right: '#10b981' },
    { y: 262, top: '#22d3ee', left: '#0891b2', right: '#06b6d4' },
    { y: 194, top: '#818cf8', left: '#4f46e5', right: '#6366f1' },
  ]
  layers.forEach((l, k) => {
    const bob = Math.sin(a + k * 1.3) * 9
    slab(g, cx, l.y + bob, 260, 130, 18, l.top, l.left, l.right)
  })

  nodes.filter((n) => n.d >= 0).forEach(drawNode)
}

// ---------- Certificates: writing lines + stamping seal ----------
function certificates(g, p) {
  const out = fadeOut(p, 0.92, 0.99)
  g.fillStyle = '#ffffff'
  g.strokeStyle = '#fbbf24'
  g.lineWidth = 3
  g.beginPath()
  g.roundRect(440, 80, 520, 390, 20)
  g.fill()
  g.stroke()
  g.strokeStyle = '#f9a8d4'
  g.lineWidth = 2
  g.setLineDash([8, 8])
  g.beginPath()
  g.roundRect(456, 96, 488, 358, 14)
  g.stroke()
  g.setLineDash([])

  g.globalAlpha = out
  const write = (start, x, y, w, h, fill) => {
    const r = ease(seg(p, start, start + 0.12))
    if (r <= 0) return
    g.save()
    g.beginPath()
    g.rect(x - 2, y - 6, w * r + 4, h + 12)
    g.clip()
    g.fillStyle = fill
    g.beginPath()
    g.roundRect(x, y, w, h, h / 2)
    g.fill()
    g.restore()
  }
  const tg = g.createLinearGradient(480, 0, 740, 0)
  tg.addColorStop(0, '#d946ef')
  tg.addColorStop(1, '#f43f5e')
  write(0.05, 480, 124, 260, 22, tg)
  write(0.14, 480, 162, 180, 12, '#fbcfe8')
  write(0.22, 480, 214, 400, 12, '#c4b5fd')
  write(0.3, 480, 242, 360, 12, '#c4b5fd')
  write(0.38, 480, 270, 300, 12, '#c4b5fd')

  g.strokeStyle = 'rgba(10,10,10,0.12)'
  g.lineWidth = 2
  g.beginPath()
  g.moveTo(470, 384)
  g.lineTo(680, 384)
  g.stroke()
  const sr = ease(seg(p, 0.56, 0.7))
  if (sr > 0) {
    g.strokeStyle = '#6366f1'
    g.lineWidth = 4
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.beginPath()
    const N = 60
    for (let i = 0; i <= N * sr; i++) {
      const u = i / N
      const x = 480 + 190 * u
      const y = 356 + 18 * Math.sin(u * TAU * 2.5) * (1 - 0.4 * u) - 10 * u
      if (i) g.lineTo(x, y)
      else g.moveTo(x, y)
    }
    g.stroke()
  }

  const ss = seg(p, 0.72, 0.8)
  if (ss > 0) {
    const s = lerp(1.7, 1, easeOut(ss))
    g.save()
    g.globalAlpha = ease(ss) * out
    g.translate(870, 395)
    g.scale(s, s)
    g.fillStyle = '#f43f5e'
    g.beginPath()
    g.moveTo(-18, 30)
    g.lineTo(-40, 92)
    g.lineTo(-22, 82)
    g.lineTo(-6, 96)
    g.lineTo(4, 34)
    g.closePath()
    g.fill()
    g.fillStyle = '#d946ef'
    g.beginPath()
    g.moveTo(18, 30)
    g.lineTo(40, 92)
    g.lineTo(22, 82)
    g.lineTo(6, 96)
    g.lineTo(-4, 34)
    g.closePath()
    g.fill()
    const sg = g.createRadialGradient(0, 0, 6, 0, 0, 60)
    sg.addColorStop(0, '#fde68a')
    sg.addColorStop(0.6, '#f59e0b')
    sg.addColorStop(1, '#ef4444')
    g.fillStyle = sg
    g.beginPath()
    for (let i = 0; i <= 180; i++) {
      const t = (i / 180) * TAU
      const rr = 54 + 4 * Math.sin(18 * t)
      const x = Math.cos(t) * rr
      const y = Math.sin(t) * rr
      if (i) g.lineTo(x, y)
      else g.moveTo(x, y)
    }
    g.closePath()
    g.fill()
    g.strokeStyle = 'rgba(255,255,255,0.9)'
    g.lineWidth = 3
    g.beginPath()
    g.arc(0, 0, 38, 0, TAU)
    g.stroke()
    g.fillStyle = '#fff'
    star(g, 0, 0, 20, 9, 0)
    g.fill()
    g.restore()
  }
  const rs = seg(p, 0.74, 0.86)
  if (rs > 0 && rs < 1) {
    g.globalAlpha = (1 - rs) * 0.5 * out
    g.strokeStyle = '#f43f5e'
    g.lineWidth = 4
    g.beginPath()
    g.arc(870, 395, lerp(60, 130, easeOut(rs)), 0, TAU)
    g.stroke()
  }
  g.globalAlpha = 1
}

const DESIGNS = { projects, internships, achievements, cp, stacks, certificates }
const TINTS = {
  projects: '#e9e5fb',
  internships: '#fde7d2',
  achievements: '#fdf0c4',
  cp: '#d8f5e2',
  stacks: '#d9eefb',
  certificates: '#fbdcee',
}

export function makeCardTexture({ title, index, id }) {
  const canvas = document.createElement('canvas')
  canvas.width = RW
  canvas.height = RH
  const g = canvas.getContext('2d')

  // static background layer
  const bgc = document.createElement('canvas')
  bgc.width = RW
  bgc.height = RH
  const b = bgc.getContext('2d')
  b.scale(RS, RS)
  const bg = b.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#fdfdfc')
  bg.addColorStop(1, TINTS[id] || '#ececea')
  b.fillStyle = bg
  b.fillRect(0, 0, W, H)

  // static title + arrow layer
  const ov = document.createElement('canvas')
  ov.width = RW
  ov.height = RH
  const o = ov.getContext('2d')
  o.scale(RS, RS)
  o.fillStyle = INK
  o.textBaseline = 'alphabetic'
  let fs = 64
  o.font = `400 ${fs}px Arial, sans-serif`
  while (o.measureText(title).width > 760 && fs > 34) {
    fs -= 2
    o.font = `400 ${fs}px Arial, sans-serif`
  }
  o.fillText(title, 56, H - 64)
  const cx = W - 110
  const cy = H - 96
  o.beginPath()
  o.arc(cx, cy, 44, 0, TAU)
  o.fillStyle = '#000'
  o.fill()
  o.strokeStyle = '#fff'
  o.lineWidth = 5
  o.lineCap = 'round'
  o.lineJoin = 'round'
  o.beginPath()
  o.moveTo(cx - 12, cy + 12)
  o.lineTo(cx + 12, cy - 12)
  o.moveTo(cx - 2, cy - 12)
  o.lineTo(cx + 12, cy - 12)
  o.lineTo(cx + 12, cy + 2)
  o.stroke()

  const design = DESIGNS[id]
  const offset = index * 0.83

  function render(tSec) {
    const p = ((((tSec + offset) % LOOP) + LOOP) % LOOP) / LOOP
    g.drawImage(bgc, 0, 0)
    if (design) {
      g.save()
      g.setTransform(RS, 0, 0, RS, 0, 0)
      design(g, p)
      g.restore()
    }
    g.drawImage(ov, 0, 0)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.userData.render = (tSec) => {
    render(tSec)
    texture.needsUpdate = true
  }
  render(LOOP * 0.6 - offset)
  return texture
}