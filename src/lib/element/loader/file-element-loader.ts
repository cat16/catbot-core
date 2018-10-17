import FileElement from "../file-element";
import RecursiveFileElement from "../recursive-file-element";

export abstract class FileElementLoader<E extends FileElement> {
  private directory: string;

  constructor(directory: string) {
    this.directory = directory;
  }

  public abstract load(): Map<string, E | Error>;
  public abstract initFileElement(rawElement: any): E;

  public loadElement(path: string): E | Error {
    try {
      return this.initFileElement(import(`${this.directory}/${path}`));
    } catch (err) {
      return err;
    }
  }

  public reloadElement(element: E): E | Error {
    try {
      const path =
        element instanceof RecursiveFileElement
          ? element.getFilePath()
          : element.getFileName();
      return this.initFileElement(import(`${this.directory}/${path}`));
    } catch (err) {
      return err;
    }
  }

  public getDirectory(): string {
    return this.directory;
  }
}
