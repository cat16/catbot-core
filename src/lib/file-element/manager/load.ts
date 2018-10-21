import { getDirectories, getFiles, requireFiles } from "../../util/util";
import FileElement from "../file-element";
import RecursiveFileElement from "../recursive-file-element";

export function loadElement<E extends FileElement>(
  directory: string,
  path: string,
  initFileElement: (rawElement: any) => E
): E | Error {
  try {
    return initFileElement(import(`${directory}/${path}`));
  } catch (err) {
    return err;
  }
}

export function reloadElement<E extends FileElement>(
  directory: string,
  element: E,
  initFileElement: (rawElement: any) => E
): E | Error {
  try {
    const path =
      element instanceof RecursiveFileElement
        ? element.getFilePath()
        : element.getFileName();
    return initFileElement(import(`${directory}/${path}`));
  } catch (err) {
    return err;
  }
}

export interface FlatLoadOptions {
  targetFile?: string;
}

export function loadDirFlat<E extends FileElement>(
  directory: string,
  initFileElement: (rawElement: any) => E,
  options: FlatLoadOptions = {}
): Map<string, E | Error> {
  const targetFile = options.targetFile;
  const files = targetFile
    ? getDirectories(directory).filter(dir =>
        getFiles(dir).includes(`${targetFile}.js`)
      )
    : getFiles(directory).filter(file => file.endsWith("js"));
  const elements = new Map<string, E | Error>();
  requireFiles(
    files.map(file => (targetFile ? `${file}/${targetFile}` : file))
  ).forEach((rawElement, fileName) => {
    if (targetFile) {
      fileName = fileName.slice(fileName.indexOf("/") + 1);
    }
    let element;
    try {
      element =
        rawElement instanceof Error ? rawElement : initFileElement(rawElement);
    } catch (err) {
      element = err;
    }
    elements.set(fileName, element);
  });
  return elements;
}

export function loadDirRecursive<E extends RecursiveFileElement<E>>(
  directory: string,
  initFileElement: (rawElement: any, parent?: E) => E,
  initDirElement: (name: string, parent?: E) => E,
  parent?: E
): Map<string, E | Error> {
  const files = getFiles(directory).filter(file => file.endsWith("ts"));
  const dirs = getDirectories(directory);
  const elements = new Map<string, E | Error>();
  requireFiles(files).forEach((rawElement, fileName) => {
    if (rawElement instanceof Error) {
      elements.set(fileName, rawElement);
    } else {
      try {
        const element: E = initFileElement(rawElement, parent);
        const dir = dirs.find(dirName => dirName === fileName);
        if (dir) {
          const contents = loadDirRecursive(
            `${directory}/${dir}`,
            initFileElement,
            initDirElement,
            parent
          );
          for (const pair of contents) {
            if (pair[1] instanceof Error) {
              elements.set(`${dir}/${pair[0]}`, pair[1]);
            } else {
              element.addChildren(pair[1]);
            }
          }
          dirs.splice(dirs.indexOf(dir), 1);
        }
        elements.set(fileName, element);
      } catch (err) {
        elements.set(fileName, err);
      }
    }
  });
  dirs.forEach(dir => {
    const element = initDirElement(dir, parent);
    const contents = loadDirRecursive(
      `${directory}/${dir}`,
      initFileElement,
      initDirElement,
      parent
    );
    for (const pair of contents) {
      if (pair[1] instanceof Error) {
        elements.set(`${dir}/${pair[0]}`, pair[1]);
      } else {
        element.addChildren(pair[1]);
      }
    }
    elements.set(dir, element);
  });
  return elements;
}
