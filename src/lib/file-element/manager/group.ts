import FileElement from "../file-element";
import ElementDirectoryManager from "./directory";

class ElementDirectoryGroup<
  E extends FileElement,
  G extends ElementDirectoryManager<E> = ElementDirectoryManager<E>
> {
  private managers: G[];

  constructor(managers?: G[]) {
    this.managers = managers || [];
  }

  public getAll() {
    const elements: E[] = [];
    this.managers.forEach(manager => elements.push(...manager.getElements()));
    return elements;
  }

  public getManagers(): G[] {
    return this.managers;
  }

  public loadAll(): void {
    this.managers.forEach(manager => manager.load());
  }
}
