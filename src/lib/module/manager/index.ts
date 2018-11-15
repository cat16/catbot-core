import Module from "..";
import Bot from "../../bot";
import NamedDirectoryElementManager from "../../file-element/manager/named-dir";
import Logger from "../../util/logger";
import Command from "../command";
import Event from "../event";
import ModuleLoader from "./loader";

export class ModuleManager extends NamedDirectoryElementManager<
  Module,
  ModuleLoader
> {
  private bot: Bot;

  constructor(directory: string, bot: Bot) {
    super(new ModuleLoader(`${directory}/bot_modules`, bot));
    this.bot = bot;
  }

  public getCommands(): Command[] {
    const commands: Command[] = [];
    this.getElements().forEach(botModule =>
      commands.push(...botModule.getCommandManager().getElements())
    );
    return commands;
  }

  public findCommand(name: string): Command {
    for (const botModule of this.getElements()) {
      const command = botModule.getCommandManager().find(name);
      if (command) {
        return command;
      }
    }
    return null;
  }

  public getEvents(): Event[] {
    const events = [];
    this.getElements().forEach(botModule =>
      events.push(botModule.getEventManager().getElements())
    );
    return events;
  }
}
