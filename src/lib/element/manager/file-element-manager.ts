import Logger from "../../util/logger";
import FileElement from "../file-element";

interface ElementGroup<E extends FileElement> {
  directory: string;
  elements: E[];
  loadFunc: (dir: string) => Map<string, E | Error>;
}

export default class FileElementManager<E extends FileElement> {
  private elementGroups: ElementGroup<E>[];
  private logger: Logger;

  constructor(logger: Logger) {
    this.elementGroups = [];
    this.logger = logger;
  }

  public load() {
    this.elementGroups.forEach(group => {
      const results = group.loadFunc(group.directory);
      results.forEach((result, file) => {
        if (result instanceof Error) {
          this.logger.warn(`Could not load file ${file}! Reason: ${result}`);
        } else {
          group.elements.push(result);
        }
      });
    });
  }

  public clear() {
    this.elementGroups.forEach(group => {
      group.elements = [];
    });
  }

  public addDirectory(
    directory: string,
    loadFunc: (dir: string) => Map<string, E | Error>
  ): void {
    this.elementGroups.push({
      directory,
      loadFunc,
      elements: []
    });
  }

  public getElements(): E[] {
    return [].concat.apply([], this.elementGroups.map(group => group.elements));
  }
}
