import FileElement from "../file-element";

export default interface FileElementFactory<E extends FileElement> {
  generate(ElementClass: { new (...args: any[]): E }, fileName: string): E;
}
