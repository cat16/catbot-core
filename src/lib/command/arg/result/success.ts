export default class ArgSuccess<T> {
  public readonly data: T;
  public readonly remaining: string;

  constructor(data: T, remaining: string) {
    this.data = data;
    this.remaining = remaining;
  }
}
