import { ElementManager, ElementLoader, FlatElementLoader } from './handler'
import Module from './module'
import { Bot } from '../..';

export class ModuleManager extends ElementManager<Module> {

    bot: Bot

    constructor(bot: Bot) {
        super()
        this.bot = bot
    }

    loadDirectory(directory: string) {
        this.addManager(new FlatElementLoader<Module>(
            directory,
            (rawElement) => {
                return new rawElement({
                    bot: this.bot,
                    directory: directory
                })
            },
            false
        ))
    }

}