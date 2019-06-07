import * as fs from "fs";
import { join } from "path";

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

export function createTempDir(path: string, base: string): string {
    let tempDirName = base;
    let i = 1;
    while (existsDirectory(`${path}/${tempDirName}`)) {
      tempDirName = `${base}-${++i}`;
    }
    createDirectory(`${path}/${tempDirName}`);
    return `${path}/${tempDirName}`;
  }
