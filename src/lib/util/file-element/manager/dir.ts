import FileElement from "..";
import { pathExists } from "../..";
import ElementDirectoryLoader from "../loader/dir";

export default class ElementDirectoryManager<
  E extends FileElement,
  L extends ElementDirectoryLoader<E>
> {
  private elements: E[];
  private loader: L;

  constructor(loader: L) {
    this.elements = [];
    this.loader = loader;
  }

  public load(): Map<string, Error> {
    if (!pathExists(this.getDirectory())) {
      return new Map<string, Error>();
    }
    const errors = new Map<string, Error>();
    const elementPairs = this.loader.load();
    for (const elementPair of elementPairs) {
      if (elementPair[1] instanceof Error) {
        errors.set(elementPair[0], elementPair[1]);
      } else {
        this.elements.push(elementPair[1]);
      }
    }
    return errors;
  }

  public getDirectory(): string {
    return this.loader.getDirectory();
  }

  public getElements(): E[] {
    return this.elements;
  }
}
