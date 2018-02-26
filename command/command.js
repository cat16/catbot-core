const eris = require('eris')
const Message = eris.Message // eslint-disable-line no-unused-vars

const Arg = require('./arg.js') // eslint-disable-line no-unused-vars
const Logger = require('../util/logger.js')
const Catbot = require('../bot.js') // eslint-disable-line no-unused-vars
const CTIcols = require('../default/database.js').commands.cols
const TableManager = require('../util/table-manager.js') // eslint-disable-line no-unused-vars

/**
 * @param {Message} msg
 * @param {string | object} content
 * @param {Catbot} bot
 */
const RunFunction = (msg, content, bot) => { } // eslint-disable-line no-unused-vars

class Command {
  /**
   * @typedef CommandOptions
   * @prop {string} name the name of the command
   * @prop {RunFunction} run the function to be executed when the command is successfully detected and requirements fufilled
   * @prop {string[]} [aliases] more names for the command
   * @prop {Command[]} [subcommands] subcommands of this command; use instead of arguements if you want to do completely different things
   * @prop {boolean} [defaultPermission] whether the command should be usable by everyone; tags restrict use rather than enable
   * @prop {string[]} [defaultTags] tags you want this command to start with; they can enable and disable use based on what tags the user has
   * @prop {Arg[]} [args] arguements; information the user needs to add after the command in order for it to work
   * @prop {boolean} [silent] whether or not to log that this command was ran
   * @prop {string} [permMode] how to treat permissions with the parent command (useless if not a subcommand)
   */

  /**
   * @param {CommandOptions} options
   */
  constructor (options) {
    this.name = options.name
    this.aliases = options.aliases || []
    this.subcommands = options.subcommands || []
    this.defaultPermission = options.defaultPermission
    this.defaultTags = options.defaultTags || []
    this.args = options.args || []
    this.silent = options.silent || false
    this.permMode = options.permMode || Command.PermMode.NONE
    this.runFunc = options.run

    /** @type {Command} */
    this.parent = null
    this.subcommands.forEach(sc => {
      sc.parent = this
    })

    this.defaultCommand = false
  }

  /**
     * @param {Message} msg
     * @param {string} content
     * @param {Catbot} bot
     * @return {Promise}
     */
  run (msg, content, bot) {
    return new Promise((resolve, reject) => {
      if (this.runFunc == null) {
        reject(new Error('no run function provided'))
        return
      }
      try {
        /** @type {Promise} */
        let result = this.runFunc(msg, content, bot)
        if (result instanceof Promise) {
          result.then(() => {
            resolve()
          }, (reason) => {
            reject(reason)
          })
        } else {
          resolve()
        }
      } catch (ex) {
        reject(ex)
      }
    })
  }

  /**
   * @return {string[]}
   */
  getTriggers () {
    return [this.name].concat(this.aliases)
  }

  /**
   * @return {string}
   */
  getFullName () {
    return this.parent == null ? this.name : `${this.parent.getFullName()} ${this.name}`
  }

  /**
   * @param {Logger} logger
   * @param {TableManager} table
   * @param {boolean} force
   * @return {Promise}
   */
  load (logger, table, force = false) {
    return new Promise(async (resolve, reject) => {
      this.logger = new Logger(`command::${this.getFullName()}`, logger)
      this.commandTable = table
      if (force || await this.getPermMode() == null) await this.setPermMode(this.permMode)
      if (force || await this.getPermissions() == null) await this.setPermissions(this.defaultTags)
      if (force || await this.getDefaultPermission() == null) await this.setDefaultPermission(this.defaultPermission)
      if (this.subcommands.length > 0) {
        let loaded = 0
        this.subcommands.forEach(sc => {
          sc.load(logger, table, force).then(() => {
            loaded++
            if (loaded === this.subcommands.length) resolve()
          })
        })
      } else {
        resolve()
      }
    })
  }

  // Database functions

  /**
   * @param {boolean} [ignoreNone] whether to return an empty array if permissions don't exist or not
   * @param {boolean} [ignoreMode] whether to ignore the perm mode or not (if so, it will treat it like the override mode)
   * @return {Promise<string[]>}
   */
  getPermissions (ignoreNone = false, ignoreMode = false) {
    return new Promise(async (resolve, reject) => {
      let permMode = await this.getPermMode(true)
      let thisPerms = await this.commandTable.getStringArray(
        { name: CTIcols.name.name, value: this.getFullName() },
        CTIcols.permissions.name, ignoreNone
      )
      if (permMode === Command.PermMode.OVERRIDE || this.parent == null || ignoreMode) {
        resolve(thisPerms)
      } else {
        let parentPerms = await this.parent.getPermissions(ignoreNone)
        switch (permMode) {
          case Command.PermMode.NONE:
            resolve(parentPerms)
            break
          case Command.PermMode.ADD:
            resolve(thisPerms == null ? parentPerms : parentPerms == null ? thisPerms : thisPerms.concat(parentPerms))
            break
          case Command.PermMode.SUBTRACT:
            resolve(thisPerms == null ? parentPerms : parentPerms == null ? null : parentPerms.filter(perm => !thisPerms.includes(perm)))
            break
          default:
            reject(new Error('Perm mode was not set valid!'))
        }
      }
    })
  }

  /**
   * @param {string[]} permissions the permissions to give the command
   * @return {Promise}
   */
  setPermissions (permissions) {
    return this.commandTable.update(
      { name: CTIcols.name.name, value: this.getFullName() },
      { name: CTIcols.permissions.name, value: permissions.join(',') },
      CTIcols
    )
  }

  /**
   * @param {boolean} ignoreNone
   * @param {boolean} ignoreParent
   * @return {Promise<boolean>}
   */
  getDefaultPermission (ignoreNone = false, ignoreParent = false) {
    return new Promise(async (resolve, reject) => {
      let defPerm = await this.commandTable.getBoolean(
        { name: CTIcols.name.name, value: this.getFullName() },
        CTIcols.defaultPermission.name
      )
      if (defPerm == null && this.parent != null && !ignoreParent) {
        resolve(this.parent.getDefaultPermission())
      } else {
        resolve(defPerm == null ? (ignoreNone ? false : null) : defPerm)
      }
    })
  }

  /**
   * @param {boolean} defaultPermission
   * @return {Promise}
   */
  setDefaultPermission (defaultPermission) {
    return this.commandTable.setBoolean(
      { name: CTIcols.name.name, value: this.getFullName() },
      { name: CTIcols.defaultPermission.name, value: defaultPermission },
      CTIcols
    )
  }

  /**
   * @param {boolean} [ignoreNone]
   * @return {Promise<boolean>}
   */
  getPermMode (ignoreNone) {
    return this.commandTable.get(
      { name: CTIcols.name.name, value: this.getFullName() },
      CTIcols.permMode.name, ignoreNone ? Command.PermMode.NONE : null
    )
  }

  /**
   * @param {string} permMode
   * @return {Promise}
   */
  setPermMode (permMode) {
    return this.commandTable.update(
      { name: CTIcols.name.name, value: this.getFullName() },
      { name: CTIcols.permMode.name, value: permMode },
      CTIcols
    )
  }
}

Command.PermMode = {
  NONE: 'none',
  OVERRIDE: 'override',
  ADD: 'add',
  SUBTRACT: 'subtract'
}

module.exports = Command
