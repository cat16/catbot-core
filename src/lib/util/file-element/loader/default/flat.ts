import FlatElementDirectoryLoader from "..";
import FileElement from "../..";
import { getDirectories, getFiles, requireFile } from "../../..";
import FileElementFactory from "../../factory";

export interface FlatLoadOptions<E extends FileElement> {
  targetFile?: string;
  createWithoutTargetFile?: boolean;
}

export default class DefaultFlatElementDirectoryLoader<
  E extends FileElement
> extends FlatElementDirectoryLoader<E> {
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

  public loadAll(): Map<string, E | Error> {
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
    const dirs = getDirectories(this.getDirectory());
    files.forEach(file => {
      const rawElement = requireFile(
        this.targetFile ? `${file}/${this.targetFile}` : file
      );
      if (rawElement instanceof Error || rawElement === undefined) {
        return rawElement;
      } else {
        let element: E | Error | null;
        try {
          element = this.factory.create(rawElement, file);
        } catch (err) {
          element = err;
        }
        if (element != null) {
          elements.set(file, element);
        }
      }
    });
    return elements;
  }

  public load(fileName: string): E | Error {
    const rawElement = requireFile(
      `${this.getDirectory()}/${fileName}` + this.targetFile
        ? `/${this.targetFile}`
        : ""
    );
    if (rawElement instanceof Error || rawElement === undefined) {
      return rawElement;
    } else {
      try {
        const element = this.factory.create(rawElement, fileName);
        if (element !== null) {
          return element;
        } else {
          return undefined;
        }
      } catch (err) {
        return err;
      }
    }
  }
}
