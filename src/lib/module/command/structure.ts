import CommandContext from "./context";

export default abstract class Command {
  public abstract getAliases(): string[];
  public abstract isSilent(): boolean;
  public abstract run(data: CommandContext): void;
}
