class Column {
  /**
   * @typedef ColumnOptions
   * @prop {string} name
   * @prop {any} value
   */

  /**
   * @param {ColumnOptions} options
   */
  constructor (options) {
    this.name = options.name
    this.value = options.value
  }
}

class ColumnInfo {
  /**
   * @typedef ColumnInfoOptions
   * @prop {string} name
   * @prop {string} type
   * @prop {boolean} [unique]
   */

  /**
   * @param {ColumnInfoOptions} options
   */
  constructor (options) {
    this.name = options.name
    this.type = options.type
    this.unique = options.unique || false
  }
}

module.exports = {
  Column,
  ColumnInfo
}
