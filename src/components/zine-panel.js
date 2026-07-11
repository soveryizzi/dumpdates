import { getZineQuestions } from '../db/zine.js'
import { resolveImageUrls } from '../db/images.js'
import { escapeHtml } from '../utils.js'

function isBlank(answer) {
  return !answer || (!answer.text && (!answer.image_urls || answer.image_urls.length === 0))
}

export async function renderZinePanel(container, { cycleId, members }) {
  const questions = await getZineQuestions(cycleId)

  const sections = await Promise.all(
    questions.map(async (q) => {
      const answerByMemberId = Object.fromEntries(q.answers.map((a) => [a.member_id, a]))

      const memberBlocks = await Promise.all(
        members.map(async (m) => {
          const answer = answerByMemberId[m.id]

          if (isBlank(answer)) {
            return `
              <div>
                <strong>${escapeHtml(m.username)}</strong>
                <p>${escapeHtml(m.username)} left this one blank</p>
              </div>
            `
          }

          const images = await resolveImageUrls(answer.image_urls || [])
          return `
            <div>
              <strong>${escapeHtml(m.username)}</strong>
              <p>${escapeHtml(answer.text || '')}</p>
              ${images.map((img) => `<img src="${img.url}" alt="" width="120" />`).join('')}
            </div>
          `
        })
      )

      return `<section><h4>${escapeHtml(q.text)}</h4>${memberBlocks.join('')}</section>`
    })
  )

  container.innerHTML = `<h3>the zine</h3>${sections.join('')}`
}
