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

export interface GetFilesOptions {
  extensions?: string[];
  trimExtension?: boolean;
}

export function getFiles(
  directory: string,
  { extensions = null, trimExtension = false }: GetFilesOptions = {}
): string[] {
  const files = fs
    .readdirSync(directory)
    .map(name => join(directory, name))
    .filter(isFile);
  const finalFiles: string[] = [];
  for (const file in files) {
    if (files.hasOwnProperty(file)) {
      let newFile = files[file];
      const extension = newFile.split(".").pop();
      if (!(extensions && extensions.find(e => e === extension))) {
        continue;
      }
      newFile = newFile.slice(directory.length + 1);
      if (trimExtension) {
        newFile = newFile
          .split(".")
          .slice(0, -1)
          .join(".");
      }
      finalFiles.push(newFile);
    }
  }
  return finalFiles;
}

export function getDirectories(directory: string): string[] {
  if (directory.endsWith("\\") || directory.endsWith("/")) {
    directory = directory.slice(0, -1);
  }
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

export function getInput(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const poll = () => {
      process.stdin.once("readable", () => {
        const chunk = process.stdin.read();
        if (chunk === null) {
          poll();
        } else {
          resolve(chunk.toString().trim());
        }
      });
    };
    poll();
  });
}

export function requireFiles(
  directory: string,
  paths: string[]
): Map<string, any | Error> {
  const results: Map<string, any | Error> = new Map();
  for (const path of paths) {
    if (
      !(
        pathExists(`${directory}/${path}.js`) ||
        pathExists(`${directory}/${path}.ts`)
      )
    ) {
      results.set(path, undefined);
      continue;
    }
    let result;
    try {
      result = require(`${directory}/${path}`);
      if (result.default !== undefined) {
        result = result.default;
      }
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

export function array<T>(x: T | T[]): T[] {
  return x instanceof Array ? x : [x];
}

export function reportErrors(
  logger: Logger,
  itemName: string,
  errors: Map<string, Error>
) {
  if (itemName.length > 0) {
    itemName = itemName.charAt(0).toUpperCase() + itemName.slice(1);
  }
  for (const errorPair of errors) {
    logger.warn(
      `${itemName} '${errorPair[0]}' could not be loaded: ${errorPair[1]}`
    );
  }
}
