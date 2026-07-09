import { onAuthStateChange } from './auth.js'
import { renderAuthPage } from './pages/auth-page.js'
import { renderGroupsPage } from './pages/groups-page.js'

const app = document.querySelector('#app')

onAuthStateChange((session) => {
  if (session) renderGroupsPage(app, session)
  else renderAuthPage(app)
})
