export default class CommandErrorType {
  public static readonly DEFAULT = new CommandErrorType(
    "Error",
    ":x:",
    0xff0000
  );
  public static readonly INVALID_INFORMATION = new CommandErrorType(
    "Invalid Input",
    ":x:",
    0xff0000
  );
  public static readonly MISSING_INFORMATION = new CommandErrorType(
    "Missing Input",
    ":question:",
    0xffff00
  );
  public static readonly PERMISSION = new CommandErrorType(
    "Permission Error",
    ":lock:",
    0xffff00
  );
  public static readonly COOLDOWN = new CommandErrorType(
    "Cooldown Error",
    ":clock1:",
    0xaaaaff
  );
  public static readonly ERROR = new CommandErrorType(
    "Error",
    ":exclamation:",
    0xff0000
  );

  private constructor(
    public readonly name: string,
    public readonly symbol: string,
    public readonly color: number
  ) {}
}
