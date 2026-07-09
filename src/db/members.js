import { dbQuery } from '../../supabase.js'

export function getGroupMembers(groupId) {
  return dbQuery(`members?group_id=eq.${groupId}&select=*`)
}

export function addMember({ groupId, userId, username }) {
  return dbQuery('members', {
    method: 'POST',
    body: { group_id: groupId, user_id: userId, username },
  })
}

export function removeMember(memberId) {
  return dbQuery(`members?id=eq.${memberId}`, { method: 'DELETE' })
}
