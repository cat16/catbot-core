import { Bot } from '../..';
import {
  ElementLoader,
  ElementManager,
  FlatElementLoader
} from '../element/loader/';
import Module from './module';

export class ModuleLoader extends FlatElementLoader<Module> {
  constructor(directory: string, bot: Bot) {
    super(
      directory,
      rawElement => {
        return new rawElement({
          bot,
          directory
        });
      },
      false
    );
  }
}

export class ModuleManager extends ElementManager<Module> {
  public bot: Bot;

  constructor(bot: Bot) {
    super();
    this.bot = bot;
  }

  public loadDirectory(directory: string) {
    this.addLoader(new ModuleLoader(directory, this.bot));
  }
}
