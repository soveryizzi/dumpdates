import { dbQuery } from '../../supabase.js'

export function getCyclesForGroup(groupId) {
  return dbQuery(`cycles?group_id=eq.${groupId}&select=*&order=month.desc`)
}

// Ensures this month's cycle row exists and locks last-window's pool if the
// 15th has passed — see sync_group_cycles() in schema.sql. Safe to call as
// often as needed; it's a no-op once everything's already in sync.
export function syncGroupCycles(groupId) {
  return dbQuery('rpc/sync_group_cycles', {
    method: 'POST',
    body: { p_group_id: groupId },
  })
}
