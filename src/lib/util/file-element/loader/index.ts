import FileElement from "..";

export interface LoadResult<E extends FileElement> {
  element: E | Error;
  found: boolean;
}

export default abstract class ElementDirectoryLoader<E extends FileElement> {
  private directory: string;
  constructor(directory: string) {
    this.directory = directory;
  }

  public abstract loadAll(): Map<string, E | Error>;
  public abstract load(fileName: string): LoadResult<E>;

  public getDirectory(): string {
    return this.directory;
  }
}
