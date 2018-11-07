export default abstract class DirLoader<E extends Element> {
  private directory: string;
  constructor(directory: string) {}

  public abstract load(): Map<string, E | Error>;
}

// CYKA BLYAT IDI NAHUY MAKE COMMAND (OBJECT) AND COMMANDINSTANCE (ACTUAL THING)
