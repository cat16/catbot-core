import ElementDirectoryLoader from ".";
import { getDirectories, getFiles, requireFiles } from "../../..";
import RecursiveElementFactory from "../../factory/recursive";
import RecursiveFileElement from "../../recursive-file-element";

export default class RecursiveElementDirectoryLoader<
  E extends RecursiveFileElement<E>
> extends ElementDirectoryLoader<E> {
  private factory: RecursiveElementFactory<E>;

  constructor(directory: string, factory: RecursiveElementFactory<E>) {
    super(directory);
    this.factory = factory;
  }

  public load(
    directory: string = this.getDirectory(),
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
          const element: E = this.factory.create(rawElement, fileName, parent);
          const dir = dirs.find(dirName => dirName === fileName);
          if (dir) {
            const contents = this.load(`${directory}/${dir}`, parent);
            for (const pair of contents) {
              if (pair[1] instanceof Error) {
                elements.set(`${dir}/${pair[0]}`, pair[1]);
              } else {
                element.children.push(pair[1]);
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
      const element = this.factory.createDir(dir, parent);
      const contents = this.load(`${directory}/${dir}`, parent);
      for (const pair of contents) {
        if (pair[1] instanceof Error) {
          elements.set(`${dir}/${pair[0]}`, pair[1]);
        } else {
          element.children.push(pair[1]);
        }
      }
      elements.set(dir, element);
    });
    return elements;
  }
}
