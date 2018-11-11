import { EventType } from ".";

export type EventRunFunc = (context: EventContext) => void

export default interface EventCreateInfo {
  type: EventType;
  run: 
}
