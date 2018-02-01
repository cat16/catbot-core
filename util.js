const eris = require('eris')
const Catbot = require('./bot.js') // eslint-disable-line no-unused-vars
const { User, Channel, TextChannel, PrivateChannel, VoiceChannel } = eris // eslint-disable-line no-unused-vars

class Util {
  /**
   * @param {Catbot} bot
   */
  constructor (bot) {
    this.bot = bot
  }

  /**
   * @param {string} userString
   * @return {User}
   */
  getUser (userString) {
    if (userString.startsWith('<@') && userString.endsWith('>')) userString = userString.slice(2, -1)
    let user = this.bot.client.users.find(u => { return u.id === userString })
    if (user) return user
    else return null
  }

  /**
   * @param {string} channelString
   * @return {Channel}
   */
  getChannel (channelString) {
    if (channelString.startsWith('<#') && channelString.endsWith('>')) channelString = channelString.slice(2, -1)
    let channel = this.bot.client.getChannel(channelString)
    if (channel) return channel
    else return null
  }

  /**
   * @param {string} channelString
   * @param {number} id
   * @return {Channel}
   */
  getChannelWithType (channelString, id) {
    let channel = this.getChannel(channelString)
    if (channel && channel.type === 0) return channel
    else return null
  }

  /**
   * @param {string} channelString
   * @return {TextChannel}
   */
  getTextChannel (channelString) {
    return this.getChannelWithType(channelString, 0)
  }

  /**
   * @param {string} channelString
   * @return {PrivateChannel}
   */
  getDMChannel (channelString) {
    return this.getChannelWithType(channelString, 1)
  }

  /**
   * @param {string} channelString
   * @return {VoiceChannel}
   */
  getVoiceChannel (channelString) {
    return this.getChannelWithType(channelString, 2)
  }
}

module.exports = Util
