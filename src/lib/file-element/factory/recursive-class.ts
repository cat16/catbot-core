import ClassElementGenerator from "./class";

export default class RecursiveClassElementGenerator<
  E
> extends ClassElementGenerator<E> {
  constructor(...args: any[]) {
    super(args);
  }
  public generate();
}
