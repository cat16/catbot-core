import FileElement from "..";
import LoadResult from "./result";

export default abstract class ElementDirectoryLoader<E extends FileElement> {
  private directory: string;
  constructor(directory: string) {
    this.directory = directory;
  }

  public abstract loadAll(): Map<string, E | Error>;
  public abstract load(fileName: string): LoadResult<E>;
  public abstract loadExternal(path: string, name: string): LoadResult<E>;

  public getDirectory(): string {
    return this.directory;
  }
}
