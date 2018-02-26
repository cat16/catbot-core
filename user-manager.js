const TableManager = require('./util/table-manager') // eslint-disable-line no-unused-vars
const UTIcols = require('./default/database.js').users.cols

class UserManager {
  /**
   * @param {TableManager} userTable
   */
  constructor (userTable) {
    this.userTable = userTable
  }

  /**
   * @param {string} id
   * @param {boolean} [ignoreNone]
   * @return {Promise<string[]>}
   */
  getUserPermTags (id, ignoreNone = false) {
    return this.userTable.getStringArray(
      { name: UTIcols.id.name, value: id },
      UTIcols.permTags.name, ignoreNone
    )
  }

  /**
   * @param {string} id
   * @param {string[]} tags
   * @return {Promise}
   */
  setUserPermTags (id, tags) {
    return this.userTable.update(
      { name: UTIcols.id.name, value: id },
      { name: UTIcols.permTags.name, value: tags.join(',') },
      UTIcols
    )
  }

  /**
   * @param {string} id
   * @return {Promise<boolean>}
   */
  getAdmin (id, ignoreNone) {
    return this.userTable.getBoolean(
      { name: UTIcols.id.name, value: id },
      UTIcols.admin.name, ignoreNone
    )
  }

  /**
   * @param {string} id
   * @param {boolean} admin
   * @return {Promise}
   */
  setAdmin (id, admin) {
    return this.userTable.setBoolean(
      { name: UTIcols.id.name, value: id },
      { name: UTIcols.admin.name, value: admin },
      UTIcols
    )
  }
}

module.exports = UserManager
