module.exports = {
  users: {
    name: 'users',
    cols: {
      id: { name: 'id', type: 'TEXT', unique: true },
      permTags: { name: 'permTags', type: 'TEXT' },
      admin: { name: 'admin', type: 'INTEGER' },
      test: { name: 'test', type: 'BLOB' }
    }
  },
  commands: {
    name: 'commands',
    cols: {
      name: { name: 'name', type: 'TEXT', unique: true },
      permissions: { name: 'permissions', type: 'TEXT' },
      defaultPermission: { name: 'defaultPermission', type: 'INTEGER' },
      permMode: { name: 'permMode', type: 'TEXT' }
    }
  }
}
