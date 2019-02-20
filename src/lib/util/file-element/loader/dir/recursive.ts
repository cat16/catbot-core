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

  public loadAll(): Map<string, E | Error> {
    return this.loadDir(this.getDirectory());
  }

  public load(fileName: string): E | Error {
    
  }

  private loadRawElement(directory: string, rawElement: any, fileName: string, folder: boolean, parent?: E): [string, E | Error] {
    try {
      const element = this.factory.create(rawElement, fileName, parent);
      if (element != null) {
        if (folder) {
          const contents = this.loadDir(`${directory}/${fileName}`, parent);
          for (const pair of contents) {
            if (pair[1] instanceof Error) {
              return [`${fileName}/${pair[0]}`, pair[1]];
            } else {
              element.children.push(pair[1]);
            }
          }
        }
        return [fileName, element];
      }
    } catch (err) {
      return [fileName, err];
    }
  }

  private loadDir(
    directory: string,
    parent?: E
  ): Map<string, E | Error> {
    const files = getFiles(directory, {
      extensions: ["js", "ts"],
      trimExtension: true
    });
    const dirs = getDirectories(directory);
    const elements = new Map<string, E | Error>();
    requireFiles(directory, files).forEach((rawElement, fileName) => {
      if (rawElement instanceof Error) {
        elements.set(fileName, rawElement);
      } else {
          // TODO: am work here    
        try {
          const element = this.factory.create(rawElement, fileName, parent);
          if (element != null) {
            const dir = dirs.find(dirName => dirName === fileName);
            if (dir) {
              const contents = this.loadDir(`${directory}/${dir}`, parent);
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
          }
        } catch (err) {
          elements.set(fileName, err);
        }
      }
    });
    dirs.forEach(dir => {
      const element = this.factory.createDir(dir, parent);
      const contents = this.loadAll(`${directory}/${dir}`, element);
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
