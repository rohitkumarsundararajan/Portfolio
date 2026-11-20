export function initNav(handlers = {}) {
  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', () => {
      const fn = handlers[el.dataset.nav]
      if (fn) fn()
      else console.log('nav:', el.dataset.nav)
    })
  })
}
