import { Element } from './handler'
import CommandManager from './command/command-manager'
import EventManager from './event/event-manager'
import { Bot } from '../..';

export interface ModuleOptions {
    name: string
    triggers?: string[]
    defaultData?: object
}

export default abstract class Module implements Element {

    private name: string
    private defaultData: object
    private commandManager: CommandManager
    private eventManager: EventManager

    constructor(bot: Bot, options: ModuleOptions) {
        this.commandManager = new CommandManager(bot)
        this.eventManager = new EventManager(bot)
        this.name = options.name
        this.defaultData = options.defaultData || {}
    }

    getName() {
        return this.name
    }

    getTriggers() {
      return [this.name]
    }
}
