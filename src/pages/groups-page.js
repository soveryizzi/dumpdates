import { signOut } from '../auth.js'
import { createGroup, joinGroupByCode, getMyGroups } from '../db/groups.js'
import { getGroupMembers } from '../db/members.js'
import { syncGroupCycles, getCyclesForGroup, adminPublishGroup } from '../db/cycles.js'
import { getCurrentCycleMonth } from '../cycle-dates.js'
import { renderNominationsPanel } from '../components/nominations-panel.js'
import { renderAnswersPanel } from '../components/answers-panel.js'
import { renderZinePanel } from '../components/zine-panel.js'
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

    // keep each group's cycle rows in sync (creates/locks as the date requires)
    // before reading them
    await Promise.all(groups.map((group) => syncGroupCycles(group.id).catch(() => {})))

    const currentMonth = getCurrentCycleMonth()

    const withDetails = await Promise.all(
      groups.map(async (group) => {
        const [members, cycles] = await Promise.all([
          getGroupMembers(group.id),
          getCyclesForGroup(group.id),
        ])
        return {
          ...group,
          members,
          currentCycle: cycles.find((c) => c.month === currentMonth),
          // cycles is already ordered month.desc, so the first 'published'
          // row is the most recent issue
          latestPublishedCycle: cycles.find((c) => c.status === 'published'),
          myMembership: members.find((m) => m.user_id === session.user.id),
        }
      })
    )

    listEl.innerHTML = withDetails
      .map((group) => {
        const isAdmin = group.admin_id === session.user.id
        const canPublishNow = isAdmin && group.currentCycle?.status === 'answering'
        return `
          <div>
            <h3>${escapeHtml(group.name)}</h3>
            <p>invite code: ${escapeHtml(group.invite_code)}</p>
            <ul>
              ${group.members.map((m) => `<li>${escapeHtml(m.username)}</li>`).join('')}
            </ul>
            <div data-panel-for="${group.id}"></div>
            ${
              canPublishNow
                ? `
                  <button data-publish-now="${group.id}">publish now (admin)</button>
                  <span data-publish-status="${group.id}"></span>
                `
                : ''
            }
            <div data-zine-for="${group.id}"></div>
          </div>
        `
      })
      .join('')

    for (const group of withDetails) {
      if (group.currentCycle && group.myMembership) {
        const panelEl = listEl.querySelector(`[data-panel-for="${group.id}"]`)
        const { id: cycleId, status: cycleStatus } = group.currentCycle
        const memberId = group.myMembership.id

        if (cycleStatus === 'nominating') {
          renderNominationsPanel(panelEl, { cycleId, memberId })
        } else {
          renderAnswersPanel(panelEl, { cycleId, cycleStatus, memberId })
        }
      }

      if (group.latestPublishedCycle) {
        const zineEl = listEl.querySelector(`[data-zine-for="${group.id}"]`)
        renderZinePanel(zineEl, { cycleId: group.latestPublishedCycle.id, members: group.members })
      }
    }

    listEl.querySelectorAll('[data-publish-now]').forEach((btn) => {
      const groupId = btn.dataset.publishNow
      const statusEl = listEl.querySelector(`[data-publish-status="${groupId}"]`)
      btn.addEventListener('click', async () => {
        statusEl.textContent = 'publishing...'
        try {
          await adminPublishGroup(groupId)
          statusEl.textContent = 'published'
          await loadGroups()
        } catch (err) {
          statusEl.textContent = err.message
        }
      })
    })
  }

  await loadGroups()
}
