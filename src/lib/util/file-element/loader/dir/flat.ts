import ElementDirectoryLoader from ".";
import FileElement from "../..";
import { getDirectories, getFiles, requireFiles } from "../../..";
import FileElementFactory from "../../factory";

export interface FlatLoadOptions<E extends FileElement> {
  targetFile?: string;
  createWithoutTargetFile?: boolean;
}

export default class FlatElementDirectoryLoader<
  E extends FileElement
> extends ElementDirectoryLoader<E> {
  private factory: FileElementFactory<E>;
  private targetFile?: string;
  private createWithoutTargetFile: boolean;

  constructor(
    directory: string,
    factory: FileElementFactory<E>,
    options: FlatLoadOptions<E> = {}
  ) {
    super(directory);
    this.factory = factory;
    this.targetFile = options.targetFile;
    this.createWithoutTargetFile = options.createWithoutTargetFile || false;
  }

  public load(): Map<string, E | Error> {
    const files = this.targetFile
      ? getDirectories(this.getDirectory()).filter(
          dir =>
            this.createWithoutTargetFile ||
            getFiles(`${this.getDirectory()}/${dir}`).find(
              file => file === this.targetFile,
              {
                extensions: ["js", "ts"],
                trimExtension: true
              }
            )
        )
      : getFiles(this.getDirectory(), {
          extensions: ["js", "ts"],
          trimExtension: true
        });
    const elements = new Map<string, E | Error>();
    requireFiles(
      this.getDirectory(),
      files.map(file => (this.targetFile ? `${file}/${this.targetFile}` : file))
    ).forEach((rawElement, fileName) => {
      if (this.targetFile) {
        fileName = fileName.split("/", 2)[0];
      }
      let element;
      try {
        element =
          rawElement instanceof Error
            ? rawElement
            : this.factory.create(rawElement, fileName);
      } catch (err) {
        element = err;
      }
      if (element != null) { elements.set(fileName, element); }
    });
    return elements;
  }
}
