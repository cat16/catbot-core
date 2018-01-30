const { Catbot, eris } = require('../core.js') // eslint-disable-line no-unused-vars
const { User, Channel, TextChannel, PrivateChannel, VoiceChannel } = eris // eslint-disable-line no-unused-vars

/**
 * @param {Catbot} bot
 */
module.exports = (bot) => {
  /**
   * @param {string} userString
   * @return {User}
   */
  let getUser = (userString) => {
    if (userString.startsWith('<@') && userString.endsWith('>')) userString = userString.slice(2, -1)
    let user = bot.client.users.find(u => { return u.id === userString })
    if (user) return user
    else return null
  }

  /**
   * @param {string} channelString
   * @return {Channel}
   */
  let getChannel = (channelString) => {
    if (channelString.startsWith('<#') && channelString.endsWith('>')) channelString = channelString.slice(2, -1)
    let channel = bot.client.getChannel(channelString)
    if (channel) return channel
    else return null
  }

  /**
   * @param {string} channelString
   * @param {number} id
   * @return {Channel}
   */
  let getChannelWithType = (channelString, id) => {
    let channel = getChannel(channelString)
    if (channel && channel.type === 0) return channel
    else return null
  }

  /**
   * @param {string} channelString
   * @return {TextChannel}
   */
  let getTextChannel = (channelString) => {
    return getChannelWithType(channelString, 0)
  }

  /**
   * @param {string} channelString
   * @return {PrivateChannel}
   */
  let getDMChannel = (channelString) => {
    return getChannelWithType(channelString, 1)
  }

  /**
   * @param {string} channelString
   * @return {VoiceChannel}
   */
  let getVoiceChannel = (channelString) => {
    return getChannelWithType(channelString, 2)
  }

  return {
    getUser,
    getChannel,
    getTextChannel,
    getDMChannel,
    getVoiceChannel
  }
}
