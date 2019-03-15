import ElementDirectoryLoader from ".";
import { getDirectories, getFiles, requireFile } from "../..";
import RecursiveElementFactory from "../factory/recursive";
import RecursiveFileElement from "../recursive-file-element";

export default class DefaultRecursiveElementDirectoryLoader<
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

  public load

  public load(
    fileName: string,
    parent?: E
  ): { element: E | Error; errors: Map<string, Error> } {
    const fileElement = this.loadFileElement(
      this.getDirectory(),
      `${parent.getFilePath()}/${fileName}`,
      parent
    );
    if (!(fileElement instanceof Error)) {
      return this.loadDirElement(
        this.getDirectory(),
        fileName,
        fileElement,
        parent
      );
    }
  }

  private loadFileElement(
    directory: string,
    name: string,
    parent?: E
  ): E | Error {
    const path = `${directory}/${name}`;
    const rawElement = requireFile(path);
    if (rawElement instanceof Error || rawElement === undefined) {
      return rawElement;
    } else {
      try {
        const element = this.factory.create(rawElement, name, parent);
        if (element !== null) {
          return element;
        } else {
          return undefined;
        }
      } catch (err) {
        return err;
      }
    }
  }

  private loadDirElement(
    directory: string,
    name: string,
    element?: E,
    parent?: E
  ): { element: E | Error; errors: Map<string, Error> } {
    const errors = new Map<string, Error>();
    const contents = this.loadDir(`${directory}/${name}`, parent);
    const children: E[] = [];
    for (const [subname, subelement] of contents) {
      if (subelement instanceof Error) {
        errors.set(`${name}/${subname}`, subelement);
      } else {
        children.push(subelement);
      }
    }
    if (children.length !== 0) {
      if (element === undefined) {
        element = this.factory.createDir(name, parent);
      }
      element.children.push(...children);
    }
    return { element, errors };
  }

  private loadDir(directory: string, parent?: E): Map<string, E | Error> {
    const files = getFiles(directory, {
      extensions: ["js", "ts"],
      trimExtension: true
    });
    const dirs = getDirectories(directory);
    const elements = new Map<string, E | Error>();
    files.forEach(file => {
      elements.set(file, this.loadFileElement(directory, file, parent));
    });
    dirs.forEach(dir => {
      const elementName = [...elements.keys()].find(name => name === dir);
      const fileElement = elementName ? elements.get(elementName) : undefined;
      const { element, errors } = this.loadDirElement(
        directory,
        dir,
        fileElement instanceof Error ? undefined : fileElement,
        parent
      );
      elements.set(dir, element);
      errors.forEach((value, key) => elements.set(key, value));
    });
    return elements;
  }
}
