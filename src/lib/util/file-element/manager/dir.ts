import FileElement from "..";
import { pathExists } from "../..";
import ElementDirectoryLoader from "../loader";
import RecursiveLoadResult from "../loader/recursive-result";

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

  public loadAll(): Map<string, Error> {
    if (!pathExists(this.getDirectory())) {
      return new Map<string, Error>();
    }
    const errors = new Map<string, Error>();
    const elementPairs = this.loader.loadAll();
    for (const elementPair of elementPairs) {
      if (elementPair[1] instanceof Error) {
        errors.set(elementPair[0], elementPair[1]);
      } else {
        this.elements.push(elementPair[1]);
      }
    }
    return errors;
  }

  public load(name: string): { found: boolean, error?: Error, subErrors?: Map<string, Error> } {
    if (!pathExists(this.getDirectory())) {
      return {
        found: false
      };
    } else {
      const result = this.loader.load(name);
      const found = result.found;
      const error = result.element instanceof Error ? result.element : undefined;
      const subErrors = result instanceof RecursiveLoadResult ? result.errors : undefined;
      return { found, error, subErrors }
    }
  }

  public getDirectory(): string {
    return this.loader.getDirectory();
  }

  public getElements(): E[] {
    return this.elements;
  }
}
