const eris = require('eris')

const Catbot = require('./bot.js')
const Command = require('./command/command.js')
const Arg = require('./command/arg.js')
const Logger = require('./util/logger.js')

module.exports = {
  Catbot,
  Command,
  Arg,
  Logger,
  eris
}
