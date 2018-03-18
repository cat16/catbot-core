let twoDigit = (num: string) => {
  return num.length === 1 ? `0${num}` : num
}

export enum MsgType {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

export default class Logger {

  name: string

  constructor(name: string, parent?: Logger, field?: string) {
    this.name = parent == null ? name : `${parent.name}->${name}`
    this.name = field == null ? name : `${name}::${field}`
  }

  getLogString(msg: string, type: MsgType = MsgType.INFO) {
    let d = new Date()
    let year = `${d.getFullYear()}`
    let month = `${d.getMonth() + 1}`
    let day = `${d.getDate()}`
    let hour = `${d.getHours()}`
    let min = `${d.getMinutes()}`
    let sec = `${d.getSeconds()}`
    month = twoDigit(month)
    day = twoDigit(day)
    hour = twoDigit(hour)
    sec = twoDigit(sec)
    let date = `${day}-${month}-${year}|${hour}:${min}:${sec}`
    return `[${date}] [${this.name}] [${type}] ${msg}`
  }

  /**
   * outputs info about what has happened or is going to happen
   */
  info(msg) {
    this.log(msg, MsgType.INFO)
  }

  /**
   * outputs a warning about something that happened
   */
  warn(msg) {
    this.log(msg, MsgType.WARN)
  }

  /**
   * outputs an error
   */
  error(msg) {
    this.log(msg, MsgType.ERROR)
  }

  /**
   * outputs debug information
   */
  debug(msg) {
    this.log(msg, MsgType.DEBUG)
  }

  /**
   * logs a message to the console
   */
  log(msg: string, type?: MsgType) {
    let send = this.getLogString(msg, type)
    switch (type) {
      default:
      case MsgType.DEBUG:
      case MsgType.INFO:
        console.log(send)
        break
      case MsgType.WARN:
        console.warn(send)
        break
      case MsgType.ERROR:
        console.error(send)
        break
    }
  }
}
