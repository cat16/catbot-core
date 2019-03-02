import FileElement from "../..";

export default abstract class ElementDirectoryLoader<E extends FileElement> {
  private directory: string;
  constructor(directory: string) {
    this.directory = directory;
  }

  public abstract loadAll(): Map<string, E | Error>;
  public abstract load(fileName: string): {element: E | Error, errors: Map<string, Error>};

  public getDirectory(): string {
    return this.directory;
  }
}
