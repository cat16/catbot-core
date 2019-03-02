import FileElementFactory from ".";
import RecursiveFileElement from "../recursive-file-element";

export default interface RecursiveElementFactory<
  E extends RecursiveFileElement<E>
> extends FileElementFactory<E> {
  create(rawElement: any, fileName: string, parent?: E): E | null;
  createDir(dirName: string, parent?: E): E;
}
