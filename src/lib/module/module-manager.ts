import { ElementLoader, ElementSearchResult } from './handler'
import Module from './module'
import { Catbot, Logger } from '../..';

export default class ModuleManager extends ElementLoader<Module> {

    constructor(bot: Catbot) {
        super(new Logger('module-manager', bot.logger), 'module')
    }
}