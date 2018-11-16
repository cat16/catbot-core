import NamedElement from "./named-element";
import RecursiveFileElement from "./recursive-file-element";

export interface NamedElementSearchOptions {
  allowAliases?: boolean;
  allowIncomplete?: boolean;
  allowLeftover?: boolean;
  recursive?: boolean;
}

export interface ElementSearchResult<E extends NamedElement> {
  element?: E;
  leftover: string;
}

export interface ElementSearchResults<E extends NamedElement> {
  exact?: ElementSearchResult<E>;
  aliases: ElementSearchResult<E>[];
  incompleteExacts: ElementSearchResult<E>[];
  incompleteAliases: ElementSearchResult<E>[];
}

export default class NamedElementSearcher<E extends NamedElement> {
  private separator: string;
  constructor(separator: string = " ") {
    this.separator = separator;
  }

  public find(
    elements: E[],
    name: string,
    options?: NamedElementSearchOptions
  ): E {
    const result = this.search(elements, name, options);
    if (!result.exact) {
      return null;
    }
    return result.exact.element;
  }

  public search(
    elements: E[],
    name: string,
    options?: NamedElementSearchOptions
  ): ElementSearchResults<E> {
    return this.searchRecursive(name, elements, options);
  }

  private searchRecursive(
    name: string,
    elements: E[],
    {
      allowAliases = true,
      allowIncomplete = true,
      allowLeftover = true,
      recursive = true
    }: NamedElementSearchOptions = {},
    parent?: E
  ): ElementSearchResults<E> {
    const options: NamedElementSearchOptions = {
      allowAliases,
      allowIncomplete,
      allowLeftover,
      recursive
    };
    const results: ElementSearchResults<E> = {
      exact: null,
      aliases: [],
      incompleteExacts: [],
      incompleteAliases: []
    };

    // first, search for equal names
    for (const element of elements) {
      // if it's directly equal
      if (element.getName() === name) {
        results.exact = { element, leftover: "" };
      } else if (allowIncomplete && element.getName().startsWith(name)) {
        results.incompleteExacts.push({ element, leftover: "" });
      }
      // if it's recursive & part of the command
      if (recursive && element instanceof RecursiveFileElement) {
        if (name.startsWith(`${element.getName()}${this.separator}`)) {
          const results2 = this.searchRecursive(
            name.slice(element.getName().length + this.separator.length),
            element.getChildren(),
            options,
            element
          );
          if (results2.exact) {
            results.exact = results2.exact;
          }
          results.aliases.push(...results2.aliases);
          results.incompleteExacts.push(...results2.incompleteExacts);
          results.incompleteAliases.push(...results2.incompleteAliases);
        } else if (
          allowIncomplete &&
          element.getName().startsWith(name.split(this.separator, 2)[0])
        ) {
          const results2 = this.searchRecursive(
            name.split(this.separator, 2)[1],
            element.getChildren(),
            options,
            element
          );
          if (results2.exact) {
            results.incompleteExacts.push(results2.exact);
          }
          results.incompleteExacts.push(...results2.incompleteExacts);
          results.incompleteAliases.push(
            ...results2.aliases,
            ...results2.incompleteAliases
          );
        }
      }
    }
    // second, search for equal aliases
    if (allowAliases) {
      for (const element of elements) {
        for (const alias of element.getAliases()) {
          // if it's directly equal
          if (alias === name) {
            results.aliases.push({ element, leftover: "" });
          } else if (allowIncomplete && alias.startsWith(name)) {
            results.incompleteAliases.push({ element, leftover: "" });
          }
          // if it's recursive & part of the command
          if (recursive && element instanceof RecursiveFileElement) {
            if (name.startsWith(`${alias}${this.separator}`)) {
              const results2 = this.searchRecursive(
                name.slice(alias.length + this.separator.length),
                element.getChildren(),
                options,
                element
              );
              if (results2.exact) {
                results.aliases.push(results2.exact);
              }
              results.aliases.push(...results2.aliases);
              results.incompleteAliases.push(
                ...results2.incompleteExacts,
                ...results2.incompleteAliases
              );
            } else if (
              allowIncomplete &&
              alias.startsWith(name.split(this.separator, 2)[0])
            ) {
              const results2 = this.searchRecursive(
                name.slice(alias.length + this.separator.length),
                element.getChildren(),
                options,
                element
              );
              if (results2.exact) {
                results.incompleteAliases.push(results2.exact);
              }
              results.incompleteAliases.push(...results2.aliases);
              results.incompleteAliases.push(
                ...results2.incompleteExacts,
                ...results2.incompleteAliases
              );
            }
          }
        }
      }
    }
    // if neither search finds a match, return the parent (which may be null) and the name
    if (!results.exact && allowLeftover) {
      results.exact = { element: parent, leftover: name };
    }
    return results;
  }
}
