import FileElement from "../file-element";

import { FileElementLoader } from "./file-element-loader";

import { getFiles, requireFiles } from "../../..";

export default class RecursiveFileElementLoader<
  E extends FileElement
> extends FileElementLoader<E> {
  public load(): Map<string, Error> {
    const files = getFiles(this.getDirectory()).filter(file =>
      file.endsWith("ts")
    );
    return requireFiles(files);
  }
}
