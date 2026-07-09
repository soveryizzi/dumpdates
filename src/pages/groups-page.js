import { signOut } from '../auth.js'
import { createGroup, joinGroupByCode, getMyGroups } from '../db/groups.js'
import { getGroupMembers } from '../db/members.js'
import { escapeHtml } from '../utils.js'

export async function renderGroupsPage(container, session) {
  container.innerHTML = `
    <h1>dumpdates</h1>
    <p>logged in as ${escapeHtml(session.user.email)}</p>
    <button id="logout-btn">log out</button>

    <section>
      <h2>create a group</h2>
      <form id="create-form">
        <input type="text" id="create-name" placeholder="group name" required />
        <input type="text" id="create-username" placeholder="your name" required />
        <button type="submit">create group</button>
      </form>
    </section>

    <section>
      <h2>join a group</h2>
      <form id="join-form">
        <input type="text" id="join-code" placeholder="invite code" required />
        <input type="text" id="join-username" placeholder="your name" required />
        <button type="submit">join group</button>
      </form>
    </section>

    <p id="groups-status"></p>
    <section id="groups-list">loading your groups...</section>
  `

  container.querySelector('#logout-btn').addEventListener('click', () => signOut())

  const status = container.querySelector('#groups-status')

  container.querySelector('#create-form').addEventListener('submit', async (event) => {
    event.preventDefault()
    const name = container.querySelector('#create-name').value
    const username = container.querySelector('#create-username').value
    status.textContent = 'creating group...'
    try {
      await createGroup({ name, username })
      event.target.reset()
      status.textContent = 'group created'
      await loadGroups()
    } catch (err) {
      status.textContent = err.message
    }
  })

  container.querySelector('#join-form').addEventListener('submit', async (event) => {
    event.preventDefault()
    const inviteCode = container.querySelector('#join-code').value.trim().toUpperCase()
    const username = container.querySelector('#join-username').value
    status.textContent = 'joining group...'
    try {
      await joinGroupByCode({ inviteCode, username })
      event.target.reset()
      status.textContent = 'joined group'
      await loadGroups()
    } catch (err) {
      status.textContent = err.message
    }
  })

  async function loadGroups() {
    const listEl = container.querySelector('#groups-list')
    const groups = await getMyGroups()

    if (groups.length === 0) {
      listEl.innerHTML = '<p>no groups yet</p>'
      return
    }

    const withMembers = await Promise.all(
      groups.map(async (group) => ({ ...group, members: await getGroupMembers(group.id) }))
    )

    listEl.innerHTML = withMembers
      .map(
        (group) => `
          <div>
            <h3>${escapeHtml(group.name)}</h3>
            <p>invite code: ${escapeHtml(group.invite_code)}</p>
            <ul>
              ${group.members.map((m) => `<li>${escapeHtml(m.username)}</li>`).join('')}
            </ul>
          </div>
        `
      )
      .join('')
  }

  await loadGroups()
}
