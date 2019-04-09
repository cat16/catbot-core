import ElementDirectoryLoader from ".";
import FileElement from "..";
import { getDirectories, getFiles, requireFile } from "../..";
import FileElementFactory from "../factory";
import LoadResult from "./result";

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
        `${this.getDirectory()}/${this.targetFile ? `${file}/${this.targetFile}` : file}`
      );
      if (rawElement instanceof Error) {
        elements.set(file, rawElement);
      } else {
        let element: E | Error | undefined;
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

  public load(fileName: string): LoadResult<E> {
    const rawElement = requireFile(
      `${this.getDirectory()}/${fileName}` + this.targetFile
        ? `/${this.targetFile}`
        : ""
    );
    if (rawElement instanceof Error) {
      return {element: rawElement, found: true};
    } else {
      if(rawElement === undefined && !this.createWithoutTargetFile) {
        return {element: undefined, found: false};
      }
      try {
        const element = this.factory.create(rawElement, fileName);
        if (element !== null) {
          return { element, found: true };
        } else {
          return { element: undefined, found: false };
        }
      } catch (err) {
        return { element: err, found: true };
      }
    }
  }
}
