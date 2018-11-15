import {
  AnyChannel,
  PrivateChannel,
  TextChannel,
  User,
  VoiceChannel
} from "eris";
import * as fs from "fs";
import { join } from "path";
import Bot from "../bot";
import Logger from "./logger";

export default class BotUtil {
  public bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  public getUser(userString: string): User {
    if (userString.startsWith("<@") && userString.endsWith(">")) {
      userString = userString.slice(2, -1);
    }
    if (userString.startsWith("!")) {
      userString = userString.slice(1);
    }
    const user = this.bot.getClient().users.find(u => u.id === userString);
    if (user) {
      return user;
    } else {
      return null;
    }
  }

  public getChannel(channelString: string): AnyChannel {
    if (channelString.startsWith("<#") && channelString.endsWith(">")) {
      channelString = channelString.slice(2, -1);
    }
    const channel = this.bot.getClient().getChannel(channelString);
    if (channel) {
      return channel;
    } else {
      return null;
    }
  }

  public getChannelWithType(channelString: string, id: number): AnyChannel {
    const channel = this.getChannel(channelString);
    if (channel && channel.type === 0) {
      return channel;
    } else {
      return null;
    }
  }

  public getTextChannel(channelString: string): TextChannel {
    return this.getChannelWithType(channelString, 0) as TextChannel;
  }

  public getDMChannel(channelString: string): PrivateChannel {
    return this.getChannelWithType(channelString, 1) as PrivateChannel;
  }

  public getVoiceChannel(channelString: string): VoiceChannel {
    return this.getChannelWithType(channelString, 2) as VoiceChannel;
  }
}

export function multiPromise(promises: Promise<any>[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results = [];
    let finished = 0;
    const check = () => {
      finished++;
      if (finished === promises.length) {
        resolve(results);
      }
    };
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(
        data => {
          results[i] = data;
          check();
        },
        err => {
          results[i] = err;
          check();
        }
      );
    }
  });
}

export function isFile(source: string): boolean {
  return fs.lstatSync(source).isFile();
}

export function isDirectory(source: string): boolean {
  return fs.lstatSync(source).isDirectory();
}

export function getFiles(directory: string): string[] {
  const files = fs
    .readdirSync(directory)
    .map(name => join(directory, name))
    .filter(isFile);
  for (const file in files) {
    if (files.hasOwnProperty(file)) {
      files[file] = files[file].slice(directory.length + 1);
    }
  }
  return files;
}

export function getDirectories(directory: string): string[] {
  const dirs = fs
    .readdirSync(directory)
    .map(name => join(directory, name))
    .filter(isDirectory);
  for (const dir in dirs) {
    if (dirs.hasOwnProperty(dir)) {
      dirs[dir] = dirs[dir].slice(directory.length + 1);
    }
  }
  return dirs;
}

export function pathExists(path: string): boolean {
  return fs.existsSync(path);
}

export function createDirectory(path: string): void {
  fs.mkdirSync(path);
}

export function loadFile(path: string): any {
  if (path.endsWith(".js")) {
    const required = require(path);
    delete require.cache[require.resolve(path)];
    return required.default == null ? required : required.default;
  }
}

export async function getInput(
  msg?: string,
  logger = new Logger("util", null, "getInput")
): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    if (msg) {
      logger.log(msg);
    }
    process.stdin.once("readable", () => {
      const chunk = process.stdin.read();
      resolve(chunk);
    });
  });
}

export function requireFiles(paths: string[]): Map<string, any | Error> {
  const results: Map<string, any | Error> = new Map();
  for (const path of paths) {
    let result;
    try {
      result = require(path);
    } catch (err) {
      result = err;
    }
    results.set(path, result);
  }
  return results;
}

export function startsWithAny(str: string, arr: string[]): string {
  let longest = "";
  arr.forEach(str2 => {
    if (str2.length > longest.length && str.startsWith(str2)) {
      longest = str2;
    }
  });
  return longest.length === 0 ? null : longest;
}
