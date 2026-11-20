import gsap from 'gsap'

const BAR_W = 72
const BAR_H = 8
const BAR_GAP = 16
const FILL_TIME = 0.75

export function playBoot({ carousel, onDone = () => {} }) {
  const root = document.createElement('div')
  root.style.cssText = 'position:fixed;inset:0;z-index:50;pointer-events:none;'
  document.body.appendChild(root)

  // exact screen position of the 3 home tiles (left, centre, right)
  carousel.prepareBoot(BAR_W, BAR_H)
  const rects = [-1, 0, 1].map((o) => carousel.cardRect(o))

  const bars = [0, 1, 2].map(() => {
    const el = document.createElement('div')
    el.style.cssText =
      'position:absolute;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.35);'
    const fill = document.createElement('div')
    fill.style.cssText =
      'position:absolute;inset:0;background:#fff;transform-origin:left center;transform:scaleX(0);'
    el.appendChild(fill)
    root.appendChild(el)
    return { el, fill }
  })

  const total = 3 * BAR_W + 2 * BAR_GAP
  bars.forEach((b, i) =>
    gsap.set(b.el, {
      left: window.innerWidth / 2 - total / 2 + i * (BAR_W + BAR_GAP),
      top: window.innerHeight / 2 - BAR_H / 2,
      width: BAR_W,
      height: BAR_H,
      borderRadius: BAR_H / 2,
      opacity: 0,
    })
  )

  const ready = Promise.all([
    new Promise((r) =>
      document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })
    ),
    document.fonts ? document.fonts.ready : Promise.resolve(),
  ])

  // 1) loader: bars fill one after another
  const fillTl = gsap.timeline()
  fillTl.to(bars.map((b) => b.el), { opacity: 1, duration: 0.4, stagger: 0.08 })
  bars.forEach((b) =>
    fillTl.to(b.fill, { scaleX: 1, duration: FILL_TIME, ease: 'power2.inOut' }, '>+0.05')
  )

  Promise.all([ready, new Promise((r) => fillTl.eventCallback('onComplete', r))]).then(spread)

  // 2) bars slide to the centres of the 3 tiles, grid fades in
  function spread() {
    const cv = document.querySelector('canvas')
    const ui = [...document.querySelectorAll('.corner')]
    gsap.set([cv, ...ui].filter(Boolean), { opacity: 0 })
    document.body.classList.remove('intro')
    if (cv) gsap.to(cv, { opacity: 1, duration: 0.9, ease: 'power1.out', clearProps: 'opacity' })

    const tl = gsap.timeline({ delay: 0.1 })
    bars.forEach((b, i) => {
      tl.to(
        b.el,
        {
          left: rects[i].cx - BAR_W / 2,
          top: rects[i].cy - BAR_H / 2,
          duration: 0.9,
          ease: 'power3.inOut',
        },
        i === 1 ? 0 : 0.05
      )
    })
    tl.add(() => grow(ui))
  }

  // 3) the real tile comes out of each bar
  function grow(ui) {
    carousel.boot.featAlpha = 1 // real tiles (shrunk to bar size) take over
    bars.forEach((b) => gsap.set(b.el, { opacity: 0 }))

    const tl = gsap.timeline()
    ;[1, 0, 2].forEach((slot, k) => {
      const idx = carousel.featured[slot]
      tl.to(carousel.boot.grow, { [idx]: 1, duration: 1.3, ease: 'expo.inOut' }, k * 0.1)
    })
    tl.to(carousel.boot, { others: 1, duration: 0.9, ease: 'power2.out' }, '>-0.35')
    tl.to(ui, { opacity: 1, duration: 0.7, clearProps: 'opacity' }, '<+0.1')
    tl.add(() => {
      carousel.endBoot()
      root.remove()
      onDone()
    })
  }
}