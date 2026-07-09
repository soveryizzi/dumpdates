import {
  getQuestionBank,
  getNominationsForCycle,
  addCustomNomination,
  addBankNomination,
  removeNomination,
} from '../db/nominations.js'
import { escapeHtml } from '../utils.js'

function nominationText(nomination) {
  return nomination.question_bank?.text || nomination.custom_text
}

export async function renderNominationsPanel(container, { cycleId, cycleStatus, memberId }) {
  const nominations = await getNominationsForCycle(cycleId)

  if (cycleStatus !== 'nominating') {
    container.innerHTML = `
      <h4>question pool (${escapeHtml(cycleStatus)})</h4>
      <ul>
        ${
          nominations.map((n) => `<li>${escapeHtml(nominationText(n))}</li>`).join('') ||
          '<li>no questions yet</li>'
        }
      </ul>
    `
    return
  }

  const bank = await getQuestionBank()
  const myNominations = nominations.filter((n) => n.member_id === memberId)
  const atLimit = myNominations.length >= 3

  container.innerHTML = `
    <h4>question garden — nominate up to 3</h4>
    <ul>
      ${
        nominations
          .map((n) => {
            const removable = n.member_id === memberId
            return `<li>${escapeHtml(nominationText(n))} ${
              removable ? `<button data-remove="${n.id}">x</button>` : ''
            }</li>`
          })
          .join('') || '<li>no questions yet</li>'
      }
    </ul>
    <p>${myNominations.length}/3 nominations used</p>
    ${
      atLimit
        ? `<p>you've used your 3 nominations</p>`
        : `
          <form id="custom-form">
            <input type="text" id="custom-text" placeholder="write your own question" maxlength="140" required />
            <button type="submit">add</button>
          </form>
          <form id="bank-form">
            <select id="bank-select" required>
              <option value="" disabled selected>pick from the bank</option>
              ${bank.map((q) => `<option value="${q.id}">${escapeHtml(q.text)}</option>`).join('')}
            </select>
            <button type="submit">add</button>
          </form>
        `
    }
    <p id="nom-status"></p>
  `

  const refresh = () => renderNominationsPanel(container, { cycleId, cycleStatus, memberId })
  const status = container.querySelector('#nom-status')

  container.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await removeNomination(btn.dataset.remove)
        await refresh()
      } catch (err) {
        status.textContent = err.message
      }
    })
  })

  container.querySelector('#custom-form')?.addEventListener('submit', async (event) => {
    event.preventDefault()
    const text = container.querySelector('#custom-text').value
    try {
      await addCustomNomination({ cycleId, memberId, text })
      await refresh()
    } catch (err) {
      status.textContent = err.message
    }
  })

  container.querySelector('#bank-form')?.addEventListener('submit', async (event) => {
    event.preventDefault()
    const questionBankId = container.querySelector('#bank-select').value
    try {
      await addBankNomination({ cycleId, memberId, questionBankId })
      await refresh()
    } catch (err) {
      status.textContent = err.message
    }
  })
}
