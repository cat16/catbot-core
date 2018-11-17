import Module from "..";
import Bot from "../../bot";
import FileElementFactory from "../../util/file-element/factory";
import ModuleCreateInfo from "../create-info";

export default class ModuleFactory implements FileElementFactory<Module> {
  public readonly bot: Bot;
  public readonly directory: string;

  constructor(bot: Bot, directory: string) {
    this.bot = bot;
    this.directory = directory;
  }

  public create(rawElement: ModuleCreateInfo, fileName: string) {
    return new Module(
      fileName,
      this.bot,
      `${this.directory}/${fileName}`,
      rawElement
    );
  }
}
