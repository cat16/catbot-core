import { URL } from "url";
import Logger from "./console/logger";
import { pathExists } from "./file";

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

export function isURL(url: string) {
  try {
    // tslint:disable-next-line: no-unused-expression
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

export function clearModuleCache() {
  Object.keys(require.cache).forEach(key => {
    delete require.cache[key];
  });
}
