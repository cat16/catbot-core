import ElementDirectoryLoader from ".";
import FileElement from "..";

export default abstract class FlatElementDirectoryLoader<
  E extends FileElement
> extends ElementDirectoryLoader<E> {
  public abstract load(fileName: string): E | Error;
}
