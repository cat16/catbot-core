import FileElement from "../file-element";
import NamedElement from "../named-element";
import RecursiveFileElement from "../recursive-file-element";
import ElementDirectoryManager from "./manager";

export interface NamedElementSearchOptions {
  useAliases: boolean;
}

export default class NamedElementDirectoryManager<
  E extends FileElement & NamedElement
> extends ElementDirectoryManager<E> {
  public find(
    name: string,
    options: NamedElementSearchOptions = { useAliases: true }
  ): E {
    return this.findRecursive(name, options, this.getElements());
  }
  private findRecursive(
    name: string,
    options: NamedElementSearchOptions,
    elements: E[]
  ) {
    let element: E;

    element = elements.find(e => name.startsWith(e.getName()));
    if (element.getName() === name) {
      return element;
    }
    if (element instanceof RecursiveFileElement) {
      element = this.findRecursive(
        name.slice(element.getName().length + 1),
        options,
        element.getChildren()
      );
    }
    if (element || !options.useAliases) {
      return element;
    }

    let alias: string;
    element = elements.find(e =>
      e.getAliases().some(a => {
        if (name.startsWith(a)) {
          alias = a;
          return true;
        }
        return false;
      })
    );
    if (element.getName() === name) {
      return element;
    }
    if (element instanceof RecursiveFileElement) {
      element = this.findRecursive(
        name.slice(alias.length + 1),
        options,
        element.getChildren()
      );
    }
    return null;
  }
}
