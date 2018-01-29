class Logger {
  /**
   * @param {string} name
   * @param {Logger} [parent]
   */
  constructor (name, parent) {
    this.name = parent == null ? name : `${parent.name}::${name}`
  }

  getLogString (msg, type) {
    type = type || Logger.INFO
    let d = new Date()
    let date = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}|${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`
    return `[${date}] [${this.name}] [${type}] ${msg}`
  }

  /**
   * warns the user with a message
   */
  info (msg) {
    this.log(msg, Logger.INFO)
  }

  /**
   * warns the user with a message
   */
  warn (msg) {
    this.log(msg, Logger.WARN)
  }

  /**
   * warns the user with a message
   */
  error (msg) {
    this.log(msg, Logger.ERROR)
  }

  /**
   * warns the user with a message
   */
  debug (msg) {
    this.log(msg, Logger.DEBUG)
  }

  /**
   * logs a message to the console
   * @param {string} msg
   * @param {string} [type]
   */
  log (msg, type) {
    let send = this.getLogString(msg, type)
    switch (type) {
      default:
      case Logger.INFO:
        console.log(send)
        break
      case Logger.WARN:
        console.warn(send)
        break
      case Logger.ERROR:
        console.error(send)
        break
      case Logger.DEBUG:
        // console.debug(send)
        console.log(send)
        break
    }
  }
}

/** @constant */
Logger.INFO = 'info'
/** @constant */
Logger.WARN = 'warn'
/** @constant */
Logger.ERROR = 'error'
/** @constant */
Logger.DEBUG = 'debug'

module.exports = Logger
