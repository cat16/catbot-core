import Event from ".";
import EventContext from "./context";

export type EventRunFunc = (this: Event, context: EventContext) => void;

export default interface EventCreateInfo {
  run: EventRunFunc;
}

export function isEventCreateInfo(object) {
  return object ? (object as EventCreateInfo).run !== undefined : false;
}
