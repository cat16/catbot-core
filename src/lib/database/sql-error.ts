export default class SQLError extends Error {
  constructor () {
    super('')
  }

  addSQLMsg (err: Error): SQLError {
    this.message = err.message.slice('SQLITE_ERROR: '.length)
    this.stack = `${err.stack}\n\n${this.stack}`
    return this
  }
}
