import ElementDirectoryLoader from ".";
import { getDirectories, getFiles, pathExists, requireFile } from "../..";
import RecursiveElementFactory from "../factory/recursive";
import RecursiveFileElement from "../recursive-file-element";
import RecursiveLoadResult from "./recursive-result";

export default class RecursiveElementDirectoryLoader<
  E extends RecursiveFileElement<E>
> extends ElementDirectoryLoader<E> {
  private factory: RecursiveElementFactory<E>;

  constructor(directory: string, factory: RecursiveElementFactory<E>) {
    super(directory);
    this.factory = factory;
  }

  public loadAll(): Map<string, E | Error> {
    const contents = this.loadDir(this.getDirectory());
    if (contents === null) {
      // tslint:disable-next-line: object-literal-sort-keys
      return new Map();
    }
    return contents;
  }

  public load(fileName: string, parent?: E): RecursiveLoadResult<E> {
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
  ): RecursiveLoadResult<E> {
    const errors = new Map<string, Error>();
    const contents = this.loadDir(`${directory}/${name}`, parent);
    if (contents === null) {
      // tslint:disable-next-line: object-literal-sort-keys
      return { element: undefined, found: false, errors: new Map() };
    }
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
    // I'm not sure how they haven't fixed this lmao (tslint 3586)
    // tslint:disable-next-line: object-literal-sort-keys
    return { element, found: true, errors };
  }

  private loadDir(directory: string, parent?: E): Map<string, E | Error> {
    if (!pathExists(directory)) {
      return null;
    }
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
