const DatabaseManager = require('./database/database-manager.js') // eslint-disable-line no-unused-vars
const UTI = require('./default/database.js').users
const UTIcols = UTI.cols

class UserManager {
  /**
   * @param {DatabaseManager} dbm
   */
  constructor (dbm) {
    this.table = dbm.tables[UTI.name]
  }

  /**
   * @param {string} id
   * @param {boolean} [ignoreNone]
   * @return {Promise<string[]>}
   */
  getUserPermTags (id, ignoreNone = false) {
    return this.table.getStringArray(
      id, UTIcols.permTags.name, ignoreNone
    )
  }

  /**
   * @param {string} id
   * @param {string[]} tags
   * @return {Promise<void>}
   */
  setUserPermTags (id, tags) {
    return this.table.setStringArray(
      id,
      {
        name: UTIcols.permTags.name,
        value: tags
      }
    )
  }

  /**
   * @param {string} id
   * @return {Promise<boolean>}
   */
  getAdmin (id, ignoreNone) {
    return this.table.getBoolean(
      id, UTIcols.admin.name, ignoreNone
    )
  }

  /**
   * @param {string} id
   * @param {boolean} admin
   * @return {Promise<void>}
   */
  setAdmin (id, admin) {
    return this.table.setBoolean(
      id,
      {
        name: UTIcols.admin.name,
        value: admin
      }
    )
  }
}

module.exports = UserManager
