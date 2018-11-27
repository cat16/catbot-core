import DatabaseInterface from "./database-interface";
import DatabaseVariable from "./database-variable";

export default class GuildDatabaseVariable<T> {
  private dbi: DatabaseInterface;
  private key: string[];
  private initValue?: T;

  private variables: Map<string, DatabaseVariable<T>>;

  constructor(dbi: DatabaseInterface, key: string[], initValue?: T) {
    this.dbi = dbi;
    this.key = key;
    this.initValue = initValue;
  }

  public getValue(guildId: string): T {
    const variable = this.variables.get(guildId);
    if (variable) {
      return variable.getValue();
    } else {
      return this.initValue;
    }
  }

  public async setValue(guildId: string, value: T) {
    const variable = this.variables.get(guildId);
    if (variable) {
      return this.variables.get(guildId).setValue(value);
    } else {
      const newVariable = new DatabaseVariable(
        this.dbi,
        ["guilds", guildId, ...this.key],
        this.initValue
      );
      await newVariable.setValue(value);
      this.variables.set(guildId, newVariable);
    }
  }
}
