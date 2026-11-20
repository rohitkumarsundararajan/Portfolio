import './style.css'
import * as THREE from 'three'
import { createGrid } from './scene/grid.js'
import { createCarousel } from './scene/carousel.js'
import { createRing } from './scene/ring.js'
import { initPanel } from './ui/panel.js'
import { initNav } from './ui/nav.js'
import { initContact } from './ui/contact.js'
import { about } from './data/content.js'
import { playBoot } from './ui/loader.js'

const canvas = document.querySelector('#scene')
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setClearColor(0x000000)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 0.2, 6)
camera.lookAt(0, -0.3, 0)

const grid = createGrid()
scene.add(grid.mesh)

const ring = createRing({ camera })
scene.add(ring.group)
ring.resize(renderer)

const contact = initContact()
const contactBtn = document.querySelector('[data-nav="contact"]')
let contactOpen = false

const panel = initPanel({
  onOpen: () => carousel.setEnabled(false),
  onClose: () => {
    if (!contactOpen) carousel.setEnabled(true)
  },
})
const carousel = createCarousel({ camera, onSelect: (i) => panel.open(i) })
scene.add(carousel.group)

carousel.setEnabled(false)
playBoot({
  carousel,
  onDone: () => {
    if (!contactOpen && !panel.isOpen()) carousel.setEnabled(true)
  },
})

function openContact() {
  if (contactOpen) return
  panel.close()
  contactOpen = true
  carousel.setEnabled(false)
  ring.show()
  contact.show(ring.getHoleDiameterPx())
  contactBtn.textContent = 'Close'
}

function closeContact() {
  if (!contactOpen) return
  contactOpen = false
  ring.hide()
  contact.hide()
  carousel.setEnabled(true)
  contactBtn.textContent = 'Contact'
}

initNav({
  home: () => {
    closeContact()
    panel.close()
  },
  contact: () => (contactOpen ? closeContact() : openContact()),
  about: () => {
    closeContact()
    panel.open(about)
  },
})

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeContact()
})

const mouse = { x: 0, y: 0 }
window.addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = -((e.clientY / window.innerHeight) * 2 - 1)
})

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  ring.resize(renderer)
})

let last = 0
renderer.setAnimationLoop((t) => {
  const dt = Math.min((t - last) / 1000, 0.05)
  last = t
  grid.update(t * 0.001)
  carousel.update(dt)
  ring.update(t * 0.001, mouse)
  if (ring.isActive()) ring.renderBackground(renderer, scene, camera)
  renderer.render(scene, camera)
})