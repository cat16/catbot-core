import { ElementManager, ElementLoader, FlatElementLoader } from '../handler'
import Module from './module'
import { Bot } from '../..';

export class ModuleLoader extends FlatElementLoader<Module> {
    constructor(directory: string, bot: Bot) {
        super(
            directory,
            (rawElement) => {
                return new rawElement({
                    bot: bot,
                    directory: directory
                })
            },
            false
        )
    }
}

export class ModuleManager extends ElementManager<Module> {

    bot: Bot

    constructor(bot: Bot) {
        super()
        this.bot = bot
    }

    loadDirectory(directory: string) {
        this.addLoader(new ModuleLoader(directory, this.bot))
    }

}