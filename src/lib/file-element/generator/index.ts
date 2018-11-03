export default abstract class FileElementGenerator<E> {
  private args: any[];

  constructor(...args: any[]) {
    this.args = args;
  }
  public abstract generate(rawElement: any, fileName: string): E;
  public getArgs(): any[] {
    return this.args;
  }
}
