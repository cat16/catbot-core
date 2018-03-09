class SQLError extends Error {
  constructor () {
    super('')
  }

  /**
   * @param {Error} err
   * @return {SQLError}
   */
  addSQLMsg (err) {
    this.message = err.message.slice('SQLITE_ERROR: '.length)
    this.stack = `${err.stack}\n\n${this.stack}`
    return this
  }
}

module.exports = SQLError
