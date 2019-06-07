import EventMap from "./event-map";

export type VoidFunc = (...args: any[]) => void;

export interface EventList {
  [str: string]: VoidFunc;
  [num: number]: VoidFunc;
}

export default class BotEmitter<E extends EventList> {
  private funcMap: EventMap;

  constructor() {
    this.funcMap = new EventMap();
  }

  public on<K extends keyof E>(event: K, func: E[K]): BotEmitter<E> {
    this._get(event).push({ func, once: false });
    return this;
  }

  public once<K extends keyof E>(event: K, func: E[K]): BotEmitter<E> {
    this._get(event).push({ func, once: true });
    return this;
  }

  public emit<K extends keyof E>(event: K, ...args: Parameters<E[K]>): boolean {
    const events = this._get(event);
    this.funcMap.set(
      event,
      events.filter((e, i) => {
        e.func(...args);
        return !e.once;
      })
    );
    return events.length > 0;
  }

  public removeListener<K extends keyof E>(
    event: K,
    func: E[K]
  ): BotEmitter<E> {
    const events = this._get(event);
    const index = events.findIndex(e => e.func === func);
    if (index > -1) {
      events.splice(index, 1);
    }
    return this;
  }

  public clearListeners<K extends keyof E>(event: K): BotEmitter<E> {
    this.funcMap.delete(event);
    return this;
  }

  public clearAllListeners(): BotEmitter<E> {
    this.funcMap.clear();
    return this;
  }

  private _get<K extends keyof E>(event: K) {
    return this.funcMap.get(event) || this.funcMap.set(event, []).get(event);
  }
}
