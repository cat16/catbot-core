import Logger from "../../util/logger";
import FileElement from "../file-element";

export type LoadFunction<E extends FileElement> = (
  dir: string
) => Map<string, E | Error>;

export default class ElementDirectoryManager<E extends FileElement> {
  private directory: string;
  private elements: E[];
  private loadFunc: LoadFunction<E>;
  private logger: Logger;

  constructor(directory: string, loadFunc: LoadFunction<E>, logger: Logger) {
    this.directory = directory;
    this.elements = [];
    this.loadFunc = loadFunc;
    this.logger = logger;
  }

  public load() {
    const results = this.loadFunc(this.directory);
    results.forEach((result, file) => {
      if (result instanceof Error) {
        this.logger.warn(`Could not load file ${file}! Reason: ${result}`);
      } else {
        this.elements.push(result);
      }
    });
  }

  public clear() {
    this.elements = [];
  }

  public getElements(): E[] {
    return this.elements;
  }
}
