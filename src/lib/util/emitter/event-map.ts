import { VoidFunc } from ".";

interface EmitterEvent {
  func: VoidFunc;
  once: boolean;
}

export default class EventMap extends Map<
  string | number | symbol,
  EmitterEvent[]
> {}
