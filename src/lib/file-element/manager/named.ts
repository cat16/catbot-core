import FileElement from "..";
import NamedElement from "../named-element";
import RecursiveFileElement from "../recursive-file-element";
import ElementDirectoryGroup from "./group";

export interface NamedElementSearchOptions {
  useAliases?: boolean;
  recursive?: boolean;
}

export interface ElementSearchResult<E extends FileElement> {
  element?: E;
  leftover: string;
}

export default class NamedDirectoryElementManager<
  E extends FileElement & NamedElement
> extends ElementDirectoryGroup<E> {
  public search(
    name: string,
    options?: NamedElementSearchOptions
  ): ElementSearchResult<E> {
    return this.findRecursive(name, options, this.getAll());
  }

  public find(
    name: string,
    options?: NamedElementSearchOptions,
    allowLeftover: boolean = false
  ): E {
    const result = this.search(name, options);
    if (!allowLeftover && result.leftover) {
      return null;
    }
    return result.element;
  }

  private findRecursive(
    name: string,
    options: NamedElementSearchOptions = { useAliases: true, recursive: true },
    elements: E[],
    parent?: E
  ): ElementSearchResult<E> {
    // first, search for equal names
    for (const element of elements) {
      // if it's directly equal
      if (element.getName() === name) {
        return { element, leftover: "" };
      }
      // if it's recursive & part of the command
      if (
        name.startsWith(element.getName()) &&
        element instanceof RecursiveFileElement
      ) {
        const result = this.findRecursive(
          name.slice(element.getName().length + 1),
          options,
          element.getChildren(),
          element
        );
        if (result.element) {
          return result;
        }
      }
    }
    // second, search for equal aliases
    if (options.useAliases) {
      for (const element of elements) {
        for (const alias of element.getAliases()) {
          // if it's directly equal
          if (alias === name) {
            return { element, leftover: "" };
          }
          // if it's recursive & part of the command
          if (
            name.startsWith(alias) &&
            element instanceof RecursiveFileElement
          ) {
            const result = this.findRecursive(
              name.slice(alias.length + 1),
              options,
              element.getChildren()
            );
            if (result.element) {
              return result;
            }
          }
        }
      }
    }
    // if neither search finds a match, return the parent (which may be null) and the name
    return { element: parent, leftover: name };
  }
}
