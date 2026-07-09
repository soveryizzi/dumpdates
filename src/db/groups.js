import { dbQuery } from '../../supabase.js'

export function getMyGroups() {
  return dbQuery('groups?select=*')
}

export function getGroupById(groupId) {
  return dbQuery(`groups?id=eq.${groupId}&select=*`)
}

// Creates the group and adds the caller as its admin member, atomically —
// see the create_group() function in schema.sql.
export function createGroup({ name, username }) {
  return dbQuery('rpc/create_group', {
    method: 'POST',
    body: { p_name: name, p_username: username },
  })
}

// Looks up a group by invite code and adds the caller as a member —
// see the join_group() function in schema.sql.
export function joinGroupByCode({ inviteCode, username }) {
  return dbQuery('rpc/join_group', {
    method: 'POST',
    body: { p_invite_code: inviteCode, p_username: username },
  })
}
