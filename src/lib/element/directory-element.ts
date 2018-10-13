import { RecursiveFileElement } from "./recursive-file-element";

export default class DirectoryElement<
  T extends RecursiveFileElement<any>
> extends RecursiveFileElement<T> {
  constructor(path: string, parent?: T) {
    super(path, parent);
  }
}
