import { Element } from './handler'
import { CommandLoader } from './command/command-manager'
import { EventLoader } from './event/event-manager'
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
    private commandManager: CommandLoader
    private eventManager: EventLoader

    constructor(data: ModuleConstructionData, options: ModuleOptions) {
        this.commandManager = new CommandLoader(data.directory)
        this.eventManager = new EventLoader(data.directory)
        this.name = options.name
    }

    getTriggers(): string[] {
      return [this.name]
    }

    getName() {
        return this.name
    }

    getCommandManager(): CommandLoader {
      return this.commandManager
    }

    getEventManager(): EventLoader {
      return this.eventManager
    }
}
