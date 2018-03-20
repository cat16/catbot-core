import chalk from 'chalk'

let twoDigit = (num: string) => {
  return num.length === 1 ? `0${num}` : num
}

export enum MsgType {
  INFO = 'info',
  SUCCESS = 'success',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

export default class Logger {

  name: string

  constructor(name: string, parent?: Logger, field?: string) {
    name = chalk.cyan(name)
    name = parent == null ? name : `${parent.name}${chalk.gray('->')}${name}`
    name = field == null ? name : `${name}::${field}`
    this.name = name
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
    let typestr = `${type}`
    switch (type) {
      case MsgType.INFO:
        typestr = chalk.blue(typestr)
        break
      case MsgType.SUCCESS:
        typestr = chalk.green(typestr)
        break
      case MsgType.WARN:
        typestr = chalk.yellow(typestr)
        break
      case MsgType.ERROR:
        typestr = chalk.red(typestr)
        break
      case MsgType.DEBUG:
        typestr = chalk.yellow(typestr)
        break
    }
    return `[${chalk.gray(date)}] [${this.name}] [${typestr}] ${msg}`
  }

  /**
   * prints general information to the console
   */
  info(msg: string) {
    this.log(msg, MsgType.INFO)
  }

  /**
   * prints a success to the console
   */
  success(msg) {
    this.log(msg, MsgType.SUCCESS)
  }

  /**
   * prints a warning to the console
   */
  warn(msg: string) {
    this.log(msg, MsgType.WARN)
  }

  /**
   * prints an error to the console
   */
  error(msg: string) {
    this.log(msg, MsgType.ERROR)
  }

  /**
   * prints debug information to the console
   */
  debug(msg: string) {
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
