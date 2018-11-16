export default class EventContext {
  private data: any[];

  constructor(data: any[]) {
    this.data = data;
  }

  public get<E>(argIndex: number): E {
    return this.data[argIndex] as E;
  }
}
