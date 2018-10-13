import FileElement from '../file-element';

export abstract class FileElementLoader<E extends FileElement> {
  private directory: string;

  constructor(directory: string) {
    this.directory = directory;
  }

  public abstract load(): Map<string, E | Error>;

  public loadElement(path: string): E | Error {
    try {
      return require(path);
    } catch (err) {
      return err;
    }
  }

  public getDirectory(): string {
    return this.directory;
  }
}
