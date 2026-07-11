import { dbQuery } from '../../supabase.js'

// One query: each question with its nested answers, each answer with the
// answering member's username — PostgREST resolves both foreign-key
// relationships (questions -> answers -> members) in a single round trip.
export function getZineQuestions(cycleId) {
  return dbQuery(
    `questions?cycle_id=eq.${cycleId}&select=*,answers(*,members(username))&order=created_at.asc`
  )
}
