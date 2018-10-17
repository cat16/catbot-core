import RecursiveFileElement from "../recursive-file-element";

import { FileElementLoader } from "./file-element-loader";

import { getDirectories, getFiles, requireFiles } from "../../..";

export default abstract class RecursiveFileElementLoader<
  E extends RecursiveFileElement<E>
> extends FileElementLoader<E> {
  public abstract initFileElement(rawElement: any, parent?: E): E;
  public abstract initDirElement(dirName: any, parent?: E): E;
  public load(): Map<string, E | Error> {
    return this.loadDir(this.getDirectory());
  }

  private loadDir(directory: string, parent?: E): Map<string, E | Error> {
    const files = getFiles(directory).filter(file => file.endsWith("ts"));
    const dirs = getDirectories(directory);
    const elements = new Map<string, E | Error>();
    requireFiles(files).forEach((rawElement, fileName) => {
      if (rawElement instanceof Error) {
        elements.set(fileName, rawElement);
      } else {
        const element: E = this.initFileElement(rawElement, parent);
        const dir = dirs.find(dirName => dirName === fileName);
        if (dir) {
          const contents = this.loadDir(`${directory}/${dir}`, parent);
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
      }
    });
    dirs.forEach(dir => {
      const element = this.initDirElement(dir, parent);
      const contents = this.loadDir(`${directory}/${dir}`, parent);
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
}
