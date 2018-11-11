import DirLoader from ".";
import FileElement from "../..";
import { getDirectories, getFiles, requireFiles } from "../../../..";
import FileElementFactory from "../../factory";

export interface FlatLoadOptions {
  targetFile?: string;
}

export default class FlatDirLoader<E extends FileElement> extends DirLoader<E> {
  private factory: FileElementFactory<E>;
  private targetFile?: string;

  constructor(
    directory: string,
    factory: FileElementFactory<E>,
    options: FlatLoadOptions = {}
  ) {
    super(directory);
    this.factory = factory;
    this.targetFile = options.targetFile;
  }

  public load(): Map<string, E | Error> {
    const files = this.targetFile
      ? getDirectories(this.getDirectory()).filter(dir =>
          getFiles(dir).includes(`${this.targetFile}.js`)
        )
      : getFiles(this.getDirectory()).filter(file => file.endsWith("js"));
    const elements = new Map<string, E | Error>();
    requireFiles(
      files.map(file => (this.targetFile ? `${file}/${this.targetFile}` : file))
    ).forEach((rawElement, fileName) => {
      if (this.targetFile) {
        fileName = fileName.slice(fileName.indexOf("/") + 1);
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
      elements.set(fileName, element);
    });
    return elements;
  }
}
