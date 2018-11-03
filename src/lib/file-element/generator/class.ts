import FileElementGenerator from ".";

export default class ClassElementGenerator<E> extends FileElementGenerator<E> {
  public generate(ElementClass, fileName) {
    return new ElementClass(fileName, ...this.getArgs());
  }
}
