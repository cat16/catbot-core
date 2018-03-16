import { User, AnyChannel, TextChannel, PrivateChannel, VoiceChannel } from 'eris'
import Catbot from '../bot'

export default class Util {

  bot: Catbot

  constructor (bot: Catbot) {
    this.bot = bot
  }

  multiPromise (promises: Promise<any>[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let results = []
      let finished = 0
      let check = () => {
        finished++
        if (finished === promises.length) resolve(results)
      }
      for (let i = 0; i < promises.length; i++) {
        promises[i].then(data => {
          results[i] = data
          check()
        }, err => {
          results[i] = err
          check()
        })
      }
    })
  }

  getUser (userString: string): User {
    if (userString.startsWith('<@') && userString.endsWith('>')) userString = userString.slice(2, -1)
    if (userString.startsWith('!')) userString = userString.slice(1)
    let user = this.bot.client.users.find(u => { return u.id === userString })
    if (user) return user
    else return null
  }

  getChannel (channelString: string): AnyChannel {
    if (channelString.startsWith('<#') && channelString.endsWith('>')) channelString = channelString.slice(2, -1)
    let channel = this.bot.client.getChannel(channelString)
    if (channel) return channel
    else return null
  }

  getChannelWithType (channelString: string, id: number): AnyChannel {
    let channel = this.getChannel(channelString)
    if (channel && channel.type === 0) return channel
    else return null
  }

  getTextChannel (channelString: string): TextChannel {
    return <TextChannel> this.getChannelWithType(channelString, 0)
  }

  getDMChannel (channelString: string): PrivateChannel {
    return <PrivateChannel> this.getChannelWithType(channelString, 1)
  }

  getVoiceChannel (channelString: string): VoiceChannel {
    return <VoiceChannel> this.getChannelWithType(channelString, 2)
  }
}
