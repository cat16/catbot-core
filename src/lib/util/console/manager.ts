import InputEvent, { InputEventCreateInfo } from "./event";

const stdin = process.stdin;

export default class ConsoleInputManager {
  private static lastID = 0;
  private events: Map<number, InputEvent>;

  // todo: whY iStHiS stAtIc

  constructor() {
    this.events = new Map();
    process.stdin.on("data", this.onData);
  }

  public static start() {
    if (stdin.isPaused()) {
      stdin.resume();
    }
  }

  public static stop() {
    stdin.pause(); // TODO: account for other things using stdin
  }

  public destroy() {
    ConsoleInputManager.stop();
    stdin.removeListener("data", this.onData);
  }

  public addEvent(event: InputEvent | InputEventCreateInfo): number {
    const actualEvent =
      event instanceof InputEvent ? event : new InputEvent(event);
    const id = ConsoleInputManager.lastID++;
    this.events.set(id, actualEvent);
    return id;
  }

  public removeEvent(id: number) {
    this.events.delete(id);
  }

  private readonly onData = data => {
    if (data != null) {
      const text = data.toString().trim();
      this.events.forEach(e => {
        e.run(text);
      });
    }
  };
}
