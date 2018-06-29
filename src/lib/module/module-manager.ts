import { ElementLoader, ElementManager, FlatElementManager } from './handler'
import Module from './module'
import { Bot } from '../..';

export default class ModuleLoader extends ElementLoader<Module> {

    bot: Bot

    constructor(bot: Bot) {
        super()
        this.bot = bot
    }

    loadDirectory(directory: string) {
        this.loadManager(new FlatElementManager<Module>(
            directory,
            (rawElement) => {
                return new rawElement(this.bot)
            },
            false
        ))
    }

}