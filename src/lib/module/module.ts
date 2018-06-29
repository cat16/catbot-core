import { Element } from './handler'
import { CommandManager } from './command/command-manager'
import { EventManager } from './event/event-manager'
import { Bot } from '../..';

export interface ModuleConstructionData {
  directory: string
  bot: Bot
}

export interface ModuleOptions {
    name: string
    triggers?: string[]
    defaultData?: object
}

export default abstract class Module implements Element {

    private name: string
    private commandManager: CommandManager
    private eventManager: EventManager

    constructor(data: ModuleConstructionData, options: ModuleOptions) {
        this.commandManager = new CommandManager(data.directory)
        this.eventManager = new EventManager(data.directory)
        this.name = options.name
    }

    getTriggers(): string[] {
      return [this.name]
    }

    getName() {
        return this.name
    }

    getCommandManager(): CommandManager {
      return this.commandManager
    }

    getEventManager(): EventManager {
      return this.eventManager
    }
}
