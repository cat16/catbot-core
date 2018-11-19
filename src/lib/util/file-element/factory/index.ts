import FileElement from "..";

export default interface FileElementFactory<E extends FileElement> {
  create(rawElement: any, fileName: string): E | null;
}
