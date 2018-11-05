import FileElementFactory from ".";

export default class ClassElementGenerator<E> implements FileElementFactory<E> {
  public generate(ElementClass, fileName) {
    return new ElementClass(fileName);
  }
}
