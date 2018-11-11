import FileElement from "../..";

export default abstract class DirLoader<E extends FileElement> {
  private directory: string;
  constructor(directory: string) {
    this.directory = directory;
  }

  public abstract load(): Map<string, E | Error>;

  public getDirectory(): string {
    return this.directory;
  }
}
