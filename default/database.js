module.exports = {
  users: {
    name: 'users',
    cols: {
      id: { name: 'id', type: 'TEXT', unique: true },
      permTags: { name: 'permTags', type: 'TEXT' }
    }
  },
  commands: {
    name: 'commands',
    cols: {
      name: { name: 'name', type: 'TEXT', unique: true },
      permissions: { name: 'permissions', type: 'TEXT' }
    }
  }
}
