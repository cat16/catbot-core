import { Element, ElementConstructionData } from './element'
import CommandManager from './command/command-manager'
import EventManager from './event/event-manager'
import ModuleManager from './module-manager';
import { Catbot } from '../..';

export interface ModuleConstructionData extends ElementConstructionData {
    bot: Catbot
    manager: ModuleManager
}

export interface ModuleOptions {
    name: string
    triggers?: string[]
    defaultData?: object
}

export default abstract class Module extends Element {

    name: string
    triggers: string[]
    defaultData: object
    commandManager: CommandManager
    eventManager: EventManager

    constructor(data: ModuleConstructionData, options: ModuleOptions) {
        super(data)
        this.commandManager = new CommandManager(data.bot, data.manager.logger)
        this.eventManager = new EventManager(data.bot, data.manager.logger)

        this.name = options.name
        this.triggers = options.triggers || []
        this.defaultData = options.defaultData || {}
    }

    getAllElements(includeEmpty?: boolean): Module[] {
        return [this]
    }

    getAliases() {
        return this.triggers
    }

    getName() {
        return this.name
    }
}
