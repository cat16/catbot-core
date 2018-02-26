/**
 * @param {number} num
 */
let twoDigit = (num) => {
  return num.toString().length === 1 ? `0${num}` : num.toString()
}

class Logger {
  /**
   * @param {string} name
   * @param {Logger} [parent]
   * @param {string} [field]
   */
  constructor (name, parent, field) {
    this.name = parent == null ? name : `${parent.name}->${name}`
    this.name = field == null ? name : `${name}::${field}`
  }

  getLogString (msg, type) {
    type = type || Logger.INFO
    let d = new Date()
    let year = d.getFullYear()
    let month = d.getMonth()
    month = twoDigit(month)
    let day = d.getDate()
    day = twoDigit(day)
    let hour = d.getHours()
    hour = twoDigit(hour)
    let min = d.getMinutes()
    let sec = d.getSeconds()
    let date = `${day}-${month}-${year}|${hour}:${min}:${sec}`
    return `[${date}] [${this.name}] [${type}] ${msg}`
  }

  /**
   * outputs info about what has happened or is going to happen
   */
  info (msg) {
    this.log(msg, Logger.INFO)
  }

  /**
   * outputs a warning about something that happened
   */
  warn (msg) {
    this.log(msg, Logger.WARN)
  }

  /**
   * outputs an error
   */
  error (msg) {
    this.log(msg, Logger.ERROR)
  }

  /**
   * outputs debug information
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
