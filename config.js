class Config {
  /**
   * @typedef ConfigOptions
   * @prop {String} token
   * @prop {String} ownerID
   * @prop {String} defaultPrefix
   * @prop {boolean} [generateFolders]
   * @prop {boolean} [silent]
   * @prop {boolean} [private]
   */

  /**
   * @param {ConfigOptions} options
   */
  constructor (options) {
    if (options == null) options = {}
    this.token = options.token
    this.ownerID = options.ownerID
    this.defaultPrefix = options.defaultPrefix
    this.generateFolders = options.generateFolders || true
    this.silent = options.silent || false
    this.private = options.private || false
    // TODO: responses maybe?
  }
}

module.exports = Config
