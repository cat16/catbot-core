import * as fs from "fs";
import { join } from "path";
import Logger from "./logger";
import { URL } from "url";

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

export function pathExists(
  path: string,
  possibleExtensions?: string[]
): boolean {
  if (possibleExtensions) {
    for (const ext of possibleExtensions) {
      if (fs.existsSync(`${path}.${ext}`)) {
        return true;
      }
    }
  } else {
    return fs.existsSync(path);
  }
}

export function existsDirectory(path: string) {
  return pathExists(path) && fs.lstatSync(path).isDirectory();
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

export function requireFile(path: string): any | Error | undefined {
  if (!pathExists(path, ["js", "ts"])) {
    return undefined;
  }
  try {
    const result = require(path);
    if (result.default !== undefined) {
      return result.default;
    } else {
      return result;
    }
  } catch (err) {
    return err;
  }
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
      `${itemName} '${errorPair[0]}' could not be loaded: ${errorPair[1].stack}`
    );
  }
}

export function tuple<T extends any[] & { "0": any }>(arr: T): T {
  return arr;
}

export async function mapPromiseAll<K, V>(
  map: Map<K, V>,
  func: (key: K, value: V) => Promise<void>
) {
  const promises: Promise<void>[] = [];
  map.forEach((value, key) => {
    promises.push(func(key, value));
  });
  return Promise.all(promises);
}

export function copyDirectory(srcPath: string, destPath: string) {
  fs.readdirSync(srcPath).forEach(file => {
    const curSrcPath = `${srcPath}/${file}`;
    const curDestPath = `${destPath}/${file}`;
    if (fs.lstatSync(curSrcPath).isDirectory()) {
      if (!fs.existsSync(curDestPath)) {
        fs.mkdirSync(curDestPath);
      }
      copyDirectory(curSrcPath, curDestPath);
    } else {
      fs.copyFileSync(curSrcPath, curDestPath);
    }
  });
}

export function removeDirectory(path: string): void {
  fs.readdirSync(path).forEach(file => {
    const curPath = `${path}/${file}`;
    if (fs.lstatSync(curPath).isDirectory()) {
      removeDirectory(curPath);
    } else {
      fs.unlinkSync(curPath);
    }
  });
  fs.rmdirSync(path);
}

export function createDirectory(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

export function isURL(url: string) {
  try {
    // tslint:disable-next-line: no-unused-expression
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

export function createTempDir(path: string, base: string): string {
  let tempDirName = base;
  let i = 1;
  while (existsDirectory(`${path}/${tempDirName}`)) {
    tempDirName = `${base}-${++i}`;
  }
  createDirectory(`${path}/${tempDirName}`);
  return `${path}/${tempDirName}`;
}
