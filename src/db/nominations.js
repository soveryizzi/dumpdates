import { dbQuery } from '../../supabase.js'

export function getQuestionBank() {
  return dbQuery('question_bank?select=*&order=id.asc')
}

// Embeds the bank question's text (if this nomination came from the bank)
// in one round trip via PostgREST's foreign-key embedding.
export function getNominationsForCycle(cycleId) {
  return dbQuery(
    `nominations?cycle_id=eq.${cycleId}&select=*,question_bank(text)&order=created_at.asc`
  )
}

export function addCustomNomination({ cycleId, memberId, text }) {
  return dbQuery('nominations', {
    method: 'POST',
    body: { cycle_id: cycleId, member_id: memberId, custom_text: text },
  })
}

export function addBankNomination({ cycleId, memberId, questionBankId }) {
  return dbQuery('nominations', {
    method: 'POST',
    body: { cycle_id: cycleId, member_id: memberId, question_bank_id: Number(questionBankId) },
  })
}

export function removeNomination(nominationId) {
  return dbQuery(`nominations?id=eq.${nominationId}`, { method: 'DELETE' })
}
