import FileElement from "..";
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

  public load() {
    this.loader.load();
  }

  public getDirectory(): string {
    return this.loader.getDirectory();
  }

  public getElements(): E[] {
    return this.elements;
  }
}
