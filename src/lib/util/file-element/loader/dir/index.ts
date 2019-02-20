import FileElement from "../..";

export default abstract class ElementDirectoryLoader<E extends FileElement> {
  private directory: string;
  constructor(directory: string) {
    this.directory = directory;
  }

  public abstract loadAll(): Map<string, E | Error>;
  public abstract load(fileName: string): E | Error;
  public abstract unload(element: E): void;

  public getDirectory(): string {
    return this.directory;
  }
}
