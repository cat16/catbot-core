import FileElement from "..";
import { pathExists } from "../..";
import ElementDirectoryLoader from "../loader";
import FlatElementDirectoryLoader from "../loader/flat";
import RecursiveElementDirectoryLoader from "../loader/recursive";

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

  public load(name: string): { status: boolean | Error, subErrors?: Map<string, Error> } {
    if (!pathExists(this.getDirectory())) {
      return {
        status: false
      };
    }

    const loader = this.loader;

    if(loader instanceof FlatElementDirectoryLoader) {
      loader.load(name); //wtc
    }
    if (loader instanceof RecursiveElementDirectoryLoader) {
      loader.load(name);
    }
  }

  public getDirectory(): string {
    return this.loader.getDirectory();
  }

  public getElements(): E[] {
    return this.elements;
  }
}
