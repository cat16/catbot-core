export default class ArgSuccess<T> {
  private _data: T;
  private _remaining: string;

  constructor(data: T, remaining: string) {
    this._data = data;
    this._remaining = remaining;
  }

  get data(): T {
    return this._data;
  }

  get remaining(): string {
    return this._remaining;
  }
}
