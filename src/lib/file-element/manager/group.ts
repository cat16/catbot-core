import FileElement from "..";
import DirLoader from "../loader/dir";

export default class ElementDirectoryGroup<
  E extends FileElement,
  L extends DirLoader<E> = DirLoader<E>
> {
  private elementGroups: Map<L, E[]>;

  constructor(loaders?: L[]) {
    if (loaders) {
      loaders.forEach(loader => {
        this.elementGroups.set(loader, []);
      });
    }
  }

  public load() {
    this.getLoaders().forEach(loader => loader.load());
  }

  public getAll() {
    const elements: E[] = [];
    this.elementGroups.forEach(loaderElements =>
      elements.push(...loaderElements)
    );
    return elements;
  }

  public getLoaders(): L[] {
    return Array.from(this.elementGroups.keys());
  }
}
