import { signUp, signIn } from '../auth.js'

export function renderAuthPage(container) {
  container.innerHTML = `
    <h1>dumpdates</h1>
    <form id="auth-form">
      <input type="email" id="email" placeholder="email" required />
      <input type="password" id="password" placeholder="password" required minlength="6" />
      <button type="submit">log in</button>
      <button type="button" id="signup-btn">sign up</button>
    </form>
    <p id="status"></p>
  `

  const form = container.querySelector('#auth-form')
  const emailInput = container.querySelector('#email')
  const passwordInput = container.querySelector('#password')
  const status = container.querySelector('#status')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    status.textContent = 'logging in...'
    const { error } = await signIn(emailInput.value, passwordInput.value)
    if (error) status.textContent = error.message
  })

  container.querySelector('#signup-btn').addEventListener('click', async () => {
    if (!emailInput.value || !passwordInput.value) {
      status.textContent = 'enter an email and password first'
      return
    }
    status.textContent = 'signing up...'
    const { error } = await signUp(emailInput.value, passwordInput.value)
    status.textContent = error ? error.message : 'check your email to confirm your account'
  })
}
