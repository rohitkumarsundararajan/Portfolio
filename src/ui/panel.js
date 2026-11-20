import { tiles } from '../data/content.js'

const ARROW = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9"/></svg>'
const CLOSE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
const CHEV_L = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'
const CHEV_R = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>'

const SVG_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
const GLYPHS = {
  shield: '<path d="M12 3l7 3v5c0 5-3.2 8.2-7 10-3.8-1.8-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  landmarks: '<circle cx="12" cy="18" r="1.6"/><circle cx="6.5" cy="12" r="1.4"/><circle cx="10.5" cy="6" r="1.4"/><circle cx="15" cy="5.5" r="1.4"/><circle cx="18.5" cy="10.5" r="1.4"/><path d="M12 18L6.5 12M12 18l-1.5-12M12 18l3-12.5M12 18l6.5-7.5"/>',
  scan: '<path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3"/><path d="M8 9h8M8 12h8M8 15h5"/>',
  key: '<circle cx="8" cy="15" r="3.5"/><path d="M10.5 12.5L20 4M16 8l2.5 2.5M13.5 10.5L15 12"/>',
  api: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
  tree: '<circle cx="12" cy="5" r="2"/><circle cx="6" cy="13" r="2"/><circle cx="18" cy="13" r="2"/><circle cx="3.5" cy="20" r="1.6"/><circle cx="8.5" cy="20" r="1.6"/><path d="M11 6.8L7 11.3M13 6.8l4 4.5M5.2 14.7L4 18.5M6.9 14.7L8 18.5"/>',
  cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12L4 7.5M12 12v9"/>',
  layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
  blocks: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><path d="M13 16.5h7M16.5 13v7"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.7.6 1 1.3 1 2.1h5c0-.8.3-1.5 1-2.1A6 6 0 0012 3z"/>',
}

function el(tag, cls, text) {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (text) e.textContent = text
  return e
}

function monogram(name) {
  return name.replace(/[^A-Za-z0-9+#]/g, '').slice(0, 2)
}

function skillIcon(s) {
  const wrap = el('span', 'skill-icon')
  const mono = () => el('span', 'skill-mono', monogram(s.name))
  if (s.dev) {
    const img = new Image()
    img.alt = ''
    img.loading = 'lazy'
    img.draggable = false
    img.src = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/' + s.dev + '/' + s.dev + '-' + (s.variant || 'original') + '.svg'
    img.addEventListener('error', () => wrap.replaceChildren(mono()))
    wrap.appendChild(img)
  } else if (s.glyph && GLYPHS[s.glyph]) {
    wrap.innerHTML = SVG_OPEN + GLYPHS[s.glyph] + '</svg>'
  } else {
    wrap.appendChild(mono())
  }
  return wrap
}

function buildSkills(skills) {
  const list = el('div', 'skill-list')
  skills.forEach((s, i) => {
    const row = el('div', 'skill')
    row.appendChild(skillIcon(s))
    const body = el('div', 'skill-body')
    body.appendChild(el('div', 'skill-name', s.name))
    if (s.note) body.appendChild(el('div', 'skill-note', s.note))
    if (s.used && s.used.length) {
      const chips = el('div', 'skill-used')
      chips.appendChild(el('span', 'skill-used-label', 'Used in'))
      s.used.forEach((u) => chips.appendChild(el('span', 'skill-chip', u)))
      body.appendChild(chips)
    }
    row.appendChild(body)
    row.appendChild(el('span', 'skill-num', String(i + 1).padStart(2, '0')))
    list.appendChild(row)
  })
  return list
}

function createLightbox() {
  const box = el('div', 'lightbox')
  box.innerHTML = `
    <button class="lb-close" aria-label="Close">${CLOSE}</button>
    <button class="lb-nav lb-prev" aria-label="Previous">${CHEV_L}</button>
    <figure class="lb-figure"><img class="lb-img" alt="" /><figcaption class="lb-cap"></figcaption></figure>
    <button class="lb-nav lb-next" aria-label="Next">${CHEV_R}</button>`
  document.body.appendChild(box)
  const img = box.querySelector('.lb-img')
  const cap = box.querySelector('.lb-cap')
  let items = []
  let idx = 0
  let open = false

  function render() {
    const it = items[idx]
    img.src = it.src
    img.alt = it.caption
    cap.textContent = it.caption + (items.length > 1 ? '   ' + (idx + 1) + ' / ' + items.length : '')
    box.classList.toggle('single', items.length < 2)
  }
  function show(list, i) {
    items = list
    idx = i
    open = true
    render()
    box.classList.add('open')
  }
  function hide() {
    open = false
    box.classList.remove('open')
  }
  function step(d) {
    if (items.length < 2) return
    idx = (idx + d + items.length) % items.length
    render()
  }

  box.querySelector('.lb-close').addEventListener('click', hide)
  box.querySelector('.lb-prev').addEventListener('click', () => step(-1))
  box.querySelector('.lb-next').addEventListener('click', () => step(1))
  box.addEventListener('click', (e) => {
    if (e.target === box || e.target.classList.contains('lb-figure')) hide()
  })
  window.addEventListener(
    'keydown',
    (e) => {
      if (!open) return
      if (e.key === 'Escape') { e.stopPropagation(); hide() }
      else if (e.key === 'ArrowLeft') { e.stopPropagation(); step(-1) }
      else if (e.key === 'ArrowRight') { e.stopPropagation(); step(1) }
    },
    true
  )
  return { show, hide }
}

function buildLogo(entry) {
  const box = el('div', 'entry-logo')
  const name = entry.company || entry.heading
  const mono = () => el('span', 'entry-logo-mono', name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase())
  const img = new Image()
  img.alt = name
  img.draggable = false
  img.addEventListener('error', () => box.replaceChildren(mono()))
  img.src = entry.logo
  box.appendChild(img)
  return box
}

function buildCarousel(entry, lightbox) {
  const list = entry.images.map((it) => (typeof it === 'string' ? { src: it, label: '' } : it))
  const items = list.map((it) => ({
    src: it.src,
    caption: entry.heading + (it.label ? ' - ' + it.label : ''),
  }))
  const wrap = el('div', 'carousel')
  const stage = el('div', 'carousel-stage')
  const track = el('div', 'carousel-track')
  list.forEach((it, i) => {
    const slide = el('button', 'carousel-slide')
    slide.type = 'button'
    slide.setAttribute('aria-label', 'Enlarge ' + (it.label || entry.heading))
    const im = new Image()
    im.src = it.src
    im.alt = items[i].caption
    im.loading = 'lazy'
    im.draggable = false
    slide.appendChild(im)
    slide.addEventListener('click', () => lightbox.show(items, i))
    track.appendChild(slide)
  })
  stage.appendChild(track)

  const foot = el('div', 'carousel-foot')
  const cap = el('div', 'carousel-cap')
  foot.appendChild(cap)
  const dots = []
  let current = 0

  function update(i) {
    current = Math.max(0, Math.min(list.length - 1, i))
    dots.forEach((d, k) => d.classList.toggle('active', k === current))
    const label = list[current].label || ''
    cap.textContent = label + (list.length > 1 ? (label ? '   ' : '') + (current + 1) + ' / ' + list.length : '')
  }

  if (list.length > 1) {
    const go = (i) => track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' })
    const prev = el('button', 'carousel-nav carousel-prev')
    prev.type = 'button'
    prev.setAttribute('aria-label', 'Previous image')
    prev.innerHTML = CHEV_L
    prev.addEventListener('click', () => go(Math.max(0, current - 1)))
    const next = el('button', 'carousel-nav carousel-next')
    next.type = 'button'
    next.setAttribute('aria-label', 'Next image')
    next.innerHTML = CHEV_R
    next.addEventListener('click', () => go(Math.min(list.length - 1, current + 1)))
    stage.append(prev, next)

    const dotRow = el('div', 'carousel-dots')
    list.forEach((_, i) => {
      const d = el('button', 'carousel-dot')
      d.type = 'button'
      d.setAttribute('aria-label', 'Image ' + (i + 1))
      d.addEventListener('click', () => go(i))
      dots.push(d)
      dotRow.appendChild(d)
    })
    foot.appendChild(dotRow)
    track.addEventListener('scroll', () => update(Math.round(track.scrollLeft / track.clientWidth)), { passive: true })
  }

  update(0)
  wrap.append(stage, foot)
  return wrap
}

function buildPhoto(entry) {
  const box = el('div', 'profile-photo')
  const name = entry.photo.alt || entry.heading
  const mono = () => el('span', 'profile-photo-mono', name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase())
  const img = new Image()
  img.alt = name
  img.draggable = false
  img.addEventListener('error', () => box.replaceChildren(mono()))
  img.src = entry.photo.src
  box.appendChild(img)
  return box
}

function buildItems(items) {
  const list = el('div', 'sub-list')
  items.forEach((it) => {
    const row = el('div', 'sub-item')
    row.appendChild(el('h4', 'sub-title', it.title))
    if (it.meta) row.appendChild(el('p', 'sub-meta', it.meta))
    if (it.text) row.appendChild(el('p', 'sub-text', it.text))
    list.appendChild(row)
  })
  return list
}

function buildChips(chips) {
  const wrap = el('div', 'chip-list')
  chips.forEach((c) => wrap.appendChild(el('span', 'chip', c)))
  return wrap
}

function buildLinkRows(rows) {
  const list = el('div', 'skill-list')
  rows.forEach((r) => {
    const row = el('a', 'skill link-row')
    row.href = r.href
    row.target = '_blank'
    row.rel = 'noopener'
    row.setAttribute('aria-label', 'Open ' + r.label)
    const wrap = el('span', 'skill-icon')
    const mono = () => el('span', 'skill-mono', r.mono || monogram(r.label))
    if (r.dev) {
      const img = new Image()
      img.alt = ''
      img.draggable = false
      img.src = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/' + r.dev + '/' + r.dev + '-' + (r.variant || 'original') + '.svg'
      img.addEventListener('error', () => wrap.replaceChildren(mono()))
      wrap.appendChild(img)
    } else {
      wrap.appendChild(mono())
    }
    row.appendChild(wrap)
    const body = el('div', 'skill-body')
    body.appendChild(el('div', 'skill-name', r.label))
    if (r.note) body.appendChild(el('div', 'skill-note', r.note))
    row.appendChild(body)
    const arrow = el('span', 'link-arrow')
    arrow.innerHTML = ARROW
    row.appendChild(arrow)
    list.appendChild(row)
  })
  return list
}

export function initPanel({ onOpen = () => {}, onClose = () => {} } = {}) {
  const root = el('div', 'panel')
  root.innerHTML = `
    <div class="panel-card" role="dialog" aria-modal="true">
      <button class="panel-close" aria-label="Close">${CLOSE}</button>
      <div class="panel-left">
        <h1 class="panel-title"></h1>
        <p class="panel-desc"></p>
        <div class="panel-tags"></div>
        <nav class="panel-toc" aria-label="Contents"></nav>
        <a class="panel-arrow" target="_blank" rel="noopener" aria-label="Open link">${ARROW}</a>
      </div>
      <div class="panel-right"><div class="panel-preview"></div></div>
    </div>`
  document.body.appendChild(root)
  const lightbox = createLightbox()

  const q = (s) => root.querySelector(s)
  const els = {
    title: q('.panel-title'),
    desc: q('.panel-desc'),
    tags: q('.panel-tags'),
    toc: q('.panel-toc'),
    arrow: q('.panel-arrow'),
    preview: q('.panel-preview'),
  }
  let isOpen = false
  let entryEls = []
  let tocItems = []
  let lockUntil = 0
  let fills = []
  let gallery = []

  function addFill(node, pct) {
    node.style.width = '0%'
    node.dataset.w = pct + '%'
    fills.push(node)
  }

  function buildEntry(tile, entry) {
    const box = el('div', 'entry')
    const imgs = entry.images || (entry.image ? [entry.image] : [])
    if (entry.logo) box.appendChild(buildLogo(entry))
    else if (tile.visuals && !imgs.length) box.appendChild(el('div', 'entry-img', 'Image placeholder'))

    if (entry.photo) box.appendChild(buildPhoto(entry))
    const head = el('div', 'entry-head')
    head.appendChild(el('h3', 'entry-title', entry.heading))
    if (entry.link) {
      const a = el('a', 'entry-link')
      a.href = entry.link
      a.target = '_blank'
      a.rel = 'noopener'
      a.setAttribute('aria-label', 'Open ' + entry.heading)
      a.innerHTML = ARROW
      head.appendChild(a)
    }
    box.appendChild(head)

    if (entry.meta) box.appendChild(el('p', 'entry-meta', entry.meta))
    if (entry.text) box.appendChild(el('p', 'entry-text', entry.text))

    ;(entry.images ? [] : imgs).forEach((src) => {
      const i = gallery.length
      gallery.push({ src, caption: entry.heading + (entry.meta ? ' - ' + entry.meta : '') })
      const photo = el('button', 'entry-photo')
      photo.type = 'button'
      photo.setAttribute('aria-label', 'Enlarge ' + entry.heading)
      const im = new Image()
      im.src = src
      im.alt = entry.heading
      im.loading = 'lazy'
      im.draggable = false
      photo.appendChild(im)
      photo.addEventListener('click', () => lightbox.show(gallery, i))
      box.appendChild(photo)
    })

    if (entry.pdf) {
      const a = el('a', 'entry-pdf', 'Open PDF')
      a.href = entry.pdf
      a.target = '_blank'
      a.rel = 'noopener'
      box.appendChild(a)
    }

    if (entry.skills) box.appendChild(buildSkills(entry.skills))
    if (entry.items) box.appendChild(buildItems(entry.items))
    if (entry.chips) box.appendChild(buildChips(entry.chips))
    if (entry.linkRows) box.appendChild(buildLinkRows(entry.linkRows))
    if (entry.images) box.appendChild(buildCarousel(entry, lightbox))

    if (entry.stats) {
      const grid = el('div', 'stat-grid')
      entry.stats.forEach((s) => {
        const c = el('div', 'stat')
        c.appendChild(el('div', 'stat-value', s.value))
        c.appendChild(el('div', 'stat-label', s.label))
        if (s.sub) c.appendChild(el('div', 'stat-sub', s.sub))
        grid.appendChild(c)
      })
      box.appendChild(grid)
    }

    if (entry.meters) {
      entry.meters.forEach((m) => {
        const wrap = el('div', 'meter')
        const top = el('div', 'meter-top')
        top.appendChild(el('span', '', m.label))
        top.appendChild(el('span', '', m.value + ' / ' + m.max))
        const track = el('div', 'meter-track')
        const fill = el('div', 'meter-fill')
        track.appendChild(fill)
        wrap.append(top, track)
        box.appendChild(wrap)
        addFill(fill, Math.round((m.value / m.max) * 1000) / 10)
      })
    }

    if (entry.charts) {
      entry.charts.forEach((ch) => {
        const c = el('div', 'chart')
        if (ch.title) c.appendChild(el('p', 'chart-title', ch.title))
        const max = Math.max(...ch.items.map((i) => i.value))
        ch.items.forEach((it) => {
          const row = el('div', 'bar-row')
          row.appendChild(el('span', 'bar-label', it.label))
          const track = el('div', 'bar-track')
          const fill = el('div', 'bar-fill')
          track.appendChild(fill)
          row.appendChild(track)
          row.appendChild(el('span', 'bar-value', String(it.value)))
          c.appendChild(row)
          addFill(fill, Math.max(2, (it.value / max) * 100))
        })
        box.appendChild(c)
      })
    }

    if (entry.bullets) {
      const ul = el('ul', 'entry-list')
      entry.bullets.forEach((b) => ul.appendChild(el('li', '', b)))
      box.appendChild(ul)
    }
    return box
  }

  function setActive(i) {
    tocItems.forEach((b, k) => b.classList.toggle('active', k === i))
  }

  function goTo(i) {
    const target = entryEls[i]
    if (!target) return
    lockUntil = performance.now() + 900
    setActive(i)
    if (getComputedStyle(els.preview).overflowY === 'visible') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      const y =
        target.getBoundingClientRect().top -
        els.preview.getBoundingClientRect().top +
        els.preview.scrollTop -
        22
      els.preview.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  function syncFromScroll() {
    if (performance.now() < lockUntil || !entryEls.length) return
    const top = els.preview.getBoundingClientRect().top + 40
    let idx = 0
    entryEls.forEach((e, i) => {
      if (e.getBoundingClientRect().top <= top) idx = i
    })
    const p = els.preview
    if (p.scrollHeight > p.clientHeight + 4 && p.scrollTop + p.clientHeight >= p.scrollHeight - 4) {
      idx = entryEls.length - 1
    }
    setActive(idx)
  }

  els.preview.addEventListener('scroll', syncFromScroll, { passive: true })

  function open(index) {
    const tile = typeof index === 'number' ? tiles[index] : index
    els.title.textContent = tile.title
    els.desc.textContent = tile.description
    els.tags.replaceChildren(...tile.tags.map((t) => el('span', 'pill', t)))
    if (tile.link) {
      els.arrow.href = tile.link
      els.arrow.style.display = ''
    } else {
      els.arrow.style.display = 'none'
    }

    fills = []
    gallery = []
    entryEls = tile.entries.map((e) => buildEntry(tile, e))
    els.preview.replaceChildren(...entryEls)
    els.preview.scrollTop = 0

    tocItems = tile.entries.map((e, i) => {
      const b = el('button', 'toc-item')
      b.type = 'button'
      b.appendChild(el('span', 'toc-num', String(i + 1).padStart(2, '0')))
      b.appendChild(el('span', 'toc-label', e.heading))
      b.addEventListener('click', () => goTo(i))
      return b
    })
    els.toc.replaceChildren(...tocItems)
    els.toc.scrollTop = 0
    lockUntil = 0
    setActive(0)

    isOpen = true
    root.classList.add('open')
    const pending = fills
    requestAnimationFrame(() =>
      requestAnimationFrame(() => pending.forEach((n) => (n.style.width = n.dataset.w)))
    )
    onOpen()
  }

  function close() {
    if (!isOpen) return
    isOpen = false
    lightbox.hide()
    root.classList.remove('open')
    onClose()
  }

  q('.panel-close').addEventListener('click', close)
  root.addEventListener('click', (e) => { if (e.target === root) close() })
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })

  return { open, close, isOpen: () => isOpen }
}