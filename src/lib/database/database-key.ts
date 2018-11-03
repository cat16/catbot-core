export default abstract class DBK {
  private readonly key: string[];

  constructor(key: string[]) {
    this.key = key;
  }

  public getKey(): string[] {
    return this.key;
  }
}
