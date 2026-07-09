import { dbQuery } from '../../supabase.js'

export function getMyGroups() {
  return dbQuery('groups?select=*')
}

export function getGroupById(groupId) {
  return dbQuery(`groups?id=eq.${groupId}&select=*`)
}

export function createGroup({ name, inviteCode, adminId }) {
  return dbQuery('groups', {
    method: 'POST',
    body: { name, invite_code: inviteCode, admin_id: adminId },
  })
}
