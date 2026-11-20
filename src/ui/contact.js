import { profile } from '../data/content.js'

const ACCESS_KEY = 'e5a99903-a586-45e9-a436-7a74e072258f'
const ENDPOINT = 'https://api.web3forms.com/submit'

export function initContact() {
  const el = document.createElement('div')
  el.className = 'contact'
  el.innerHTML = `
    <p class="contact-eyebrow">Contact</p>
    <p class="contact-title">Get in touch</p>
    <p class="contact-intro">Have a question or an opportunity? Write to me below, or email me directly.</p>
    <a class="contact-mail" href="mailto:${profile.email}">${profile.email}</a>
    <form class="contact-form">
      <div class="contact-row">
        <input type="text" name="name" placeholder="Your name" autocomplete="name" required maxlength="80" />
        <input type="email" name="email" placeholder="Your email" autocomplete="email" required maxlength="120" />
      </div>
      <textarea name="message" rows="3" placeholder="Message" required maxlength="2000"></textarea>
      <input type="checkbox" name="botcheck" class="hp" tabindex="-1" autocomplete="off" />
      <button type="submit" class="contact-send">Send message</button>
      <p class="contact-status" role="status"></p>
    </form>`
  document.body.appendChild(el)

  const form = el.querySelector('form')
  const btn = el.querySelector('.contact-send')
  const status = el.querySelector('.contact-status')
  let focusTimer = 0

  function setStatus(text, error = false) {
    status.textContent = text
    status.classList.toggle('error', error)
  }

  el.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') e.stopPropagation()
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const data = new FormData(form)
    if (data.get('botcheck')) return
    btn.disabled = true
    setStatus('Sending...')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: 'New message from ' + data.get('name') + ' (portfolio)',
          from_name: 'Portfolio contact form',
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
        }),
      })
      const json = await res.json()
      if (res.ok && json.success) {
        form.reset()
        setStatus('Message sent. Thank you!')
      } else {
        setStatus(json.message || 'Could not send. Try again.', true)
      }
    } catch (err) {
      setStatus('Network error. Try again.', true)
    } finally {
      btn.disabled = false
    }
  })

  return {
    show(diameterPx) {
      el.style.width = Math.min(520, Math.round(diameterPx * 0.7)) + 'px'
      el.classList.add('open')
      clearTimeout(focusTimer)
      focusTimer = setTimeout(() => {
        if (el.classList.contains('open')) el.querySelector('input[name=name]').focus({ preventScroll: true })
      }, 1000)
    },
    hide() {
      el.classList.remove('open')
      clearTimeout(focusTimer)
      if (el.contains(document.activeElement)) document.activeElement.blur()
      setStatus('')
    },
  }
}