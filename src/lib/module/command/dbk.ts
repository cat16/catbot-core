import BaseDBK from "../../database/database-key";

export default class DBK extends BaseDBK {
  public static readonly Silent = new DBK(["silent"]);
  public static readonly RespondToUnknownCommands = new DBK([
    "respond-to-unknown-commands"
  ]);
  public static readonly CommandCooldown = new DBK(["command-cooldown"]);

  constructor(key: string[]) {
    super(["command-manager"].concat(key));
  }
}
