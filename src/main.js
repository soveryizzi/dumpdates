import { signUp, signIn, signOut, onAuthStateChange } from './auth.js'

const app = document.querySelector('#app')

function renderLoggedOut(message = '') {
  app.innerHTML = `
    <h1>dumpdates</h1>
    <form id="auth-form">
      <input type="email" id="email" placeholder="email" required />
      <input type="password" id="password" placeholder="password" required minlength="6" />
      <button type="submit">log in</button>
      <button type="button" id="signup-btn">sign up</button>
    </form>
    <p id="status">${message}</p>
  `

  const form = document.querySelector('#auth-form')
  const emailInput = document.querySelector('#email')
  const passwordInput = document.querySelector('#password')
  const status = document.querySelector('#status')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    status.textContent = 'logging in...'
    const { error } = await signIn(emailInput.value, passwordInput.value)
    if (error) status.textContent = error.message
  })

  document.querySelector('#signup-btn').addEventListener('click', async () => {
    if (!emailInput.value || !passwordInput.value) {
      status.textContent = 'enter an email and password first'
      return
    }
    status.textContent = 'signing up...'
    const { error } = await signUp(emailInput.value, passwordInput.value)
    status.textContent = error ? error.message : 'check your email to confirm your account'
  })
}

function renderLoggedIn(session) {
  app.innerHTML = `
    <h1>dumpdates</h1>
    <p>logged in as ${session.user.email}</p>
    <button id="logout-btn">log out</button>
  `
  document.querySelector('#logout-btn').addEventListener('click', () => signOut())
}

onAuthStateChange((session) => {
  if (session) renderLoggedIn(session)
  else renderLoggedOut()
})
