import EventContext from "../context";

export type EventRunFunc = (context: EventContext) => void;

export default interface EventCreateInfo {
  run: EventRunFunc;
}
