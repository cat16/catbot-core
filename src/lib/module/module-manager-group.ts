import Bot from "../bot";
import CommandInstance from "./command/instance";
import BotEvent from "./event";
import { ModuleManager } from "./manager";

export default class BotModuleManager {
  public manager: ModuleManager;

  constructor(directory: string, bot: Bot) {
    this.manager = new ModuleManager(directory, bot);
  }

  public getCommands(): CommandInstance[] {
    const commands = [];
    this.manager
      .getElements()
      .forEach(module =>
        commands.push(module.getCommandManager().getElements())
      );
    return commands;
  }

  public findCommand(name: string): CommandInstance {
    for (const botModule of this.manager.getElements()) {
      const command = botModule.getCommandManager().find(name);
      if (command) {
        return command;
      }
    }
    return null;
  }

  public getEvents(): BotEvent[] {
    const events = [];
    this.manager
      .getElements()
      .forEach(module => events.push(module.getEventManager().getElements()));
    return events;
  }
}
