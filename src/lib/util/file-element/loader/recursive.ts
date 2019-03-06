import ElementDirectoryLoader from ".";
import RecursiveFileElement from "../recursive-file-element";

export default abstract class RecursiveElementDirectoryLoader<
  E extends RecursiveFileElement<E>
> extends ElementDirectoryLoader<E> {
  public abstract load(
    fileName: string
  ): { element: E | Error; errors: Map<string, Error> };
}
