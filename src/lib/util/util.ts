import { User, AnyChannel, TextChannel, PrivateChannel, VoiceChannel } from 'eris'
import Bot from '../bot'
import * as fs from 'fs'
import * as path from 'path'

export default class BotUtil {

  bot: Bot

  constructor(bot: Bot) {
    this.bot = bot
  }

  getUser(userString: string): User {
    if (userString.startsWith('<@') && userString.endsWith('>')) userString = userString.slice(2, -1)
    if (userString.startsWith('!')) userString = userString.slice(1)
    let user = this.bot.client.users.find(u => { return u.id === userString })
    if (user) return user
    else return null
  }

  getChannel(channelString: string): AnyChannel {
    if (channelString.startsWith('<#') && channelString.endsWith('>')) channelString = channelString.slice(2, -1)
    let channel = this.bot.client.getChannel(channelString)
    if (channel) return channel
    else return null
  }

  getChannelWithType(channelString: string, id: number): AnyChannel {
    let channel = this.getChannel(channelString)
    if (channel && channel.type === 0) return channel
    else return null
  }

  getTextChannel(channelString: string): TextChannel {
    return <TextChannel>this.getChannelWithType(channelString, 0)
  }

  getDMChannel(channelString: string): PrivateChannel {
    return <PrivateChannel>this.getChannelWithType(channelString, 1)
  }

  getVoiceChannel(channelString: string): VoiceChannel {
    return <VoiceChannel>this.getChannelWithType(channelString, 2)
  }

}

export function multiPromise(promises: Promise<any>[]): Promise<any[]> {
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

export function isFile(source: string): boolean {
  return fs.lstatSync(source).isFile()
}

export function isDirectory(source: string): boolean {
  return fs.lstatSync(source).isDirectory()
}

export function getFiles(directory: string): string[] {
  let files = fs.readdirSync(directory).map(name => path.join(directory, name)).filter(isFile)
  for (let file in files) {
    files[file] = files[file].slice(directory.length + 1)
  }
  return files
}

export function getDirectories(directory: string): string[] {
  let dirs = fs.readdirSync(directory).map(name => path.join(directory, name)).filter(isDirectory)
  for (let dir in dirs) {
    dirs[dir] = dirs[dir].slice(directory.length + 1)
  }
  return dirs
}

export function pathExists(path): boolean {
  return fs.existsSync(path)
}

export function createDirectory(path): void {
  fs.mkdirSync(path)
}

export class DirectoryContents {
  files: Map<string, any>
  directories: Map<string, DirectoryContents>
  errors: Map<string, Error>
  constructor() {
    this.files = new Map<string, any>()
    this.directories = new Map<string, DirectoryContents>()
    this.errors = new Map<string, Error>()
  }
}

export function loadFile(path: string): any {
  if (path.endsWith('.js')) {
    let required = require(path)
    delete require.cache[require.resolve(path)]
    return required.default == null ? required : required.default
  }
}

export function requireDirectory(directory: string, recursive: boolean = false): DirectoryContents {
  let loaded = new DirectoryContents()
  for (let file of getFiles(directory)) {
    if (file.endsWith('.js')) {
      try {
        let value = loadFile(`${directory}/${file}`)
        loaded.files.set(file.slice(0, -3), value)
      } catch (err) {
        loaded.errors.set(file.slice(0, -3), err)
      }
    }
  }
  if (recursive) {
    for (let dir of getDirectories(directory)) {
      loaded.directories.set(dir, requireDirectory(dir, true))
    }
  }
  return loaded
}