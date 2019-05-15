import ElementDirectoryLoader from ".";
import FileElement from "..";
import { getDirectories, getFiles, requireFile } from "../..";
import FileElementFactory from "../factory";
import LoadResult from "./result";

export interface FlatLoadOptions {
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
    options: FlatLoadOptions = {}
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
    files.forEach(file => {
      const path = `${this.getDirectory()}/${file}`;
      const rawElement = requireFile(
        `${path}${
          this.targetFile ? `/${this.targetFile}` : ""
        }`
      );
      if (rawElement instanceof Error) {
        elements.set(file, rawElement);
      } else {
        let element: E | Error | undefined;
        try {
          element = this.factory.create(rawElement, file, path);
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
    return this.loadElement(`${this.getDirectory()}/${fileName}`, fileName);
  }

  public loadExternal(path: string, name: string) {
    return this.loadElement(path, name);
  }

  private loadElement(path: string, name: string): LoadResult<E> {
    const rawElement = requireFile(
      `${path}${
        this.targetFile ? `/${this.targetFile}` : ""
      }`
    );
    if (rawElement instanceof Error) {
      return { element: rawElement, found: true };
    } else {
      if (rawElement === undefined && !this.createWithoutTargetFile) {
        return { element: undefined, found: false };
      }
      try {
        const element = this.factory.create(rawElement, name, path);
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
