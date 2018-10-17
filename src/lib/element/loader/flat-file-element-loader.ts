import { getFiles, requireFiles } from "../../util/util";
import FileElement from "../file-element";
import { FileElementLoader } from "./file-element-loader";

export default abstract class FlatFileElementLoader<
  E extends FileElement
> extends FileElementLoader<E> {
  public abstract initElement(rawElement: any): E;
  public load(): Map<string, E | Error> {
    const files = getFiles(this.getDirectory()).filter(file =>
      file.endsWith("ts")
    );
    const elements = new Map<string, E | Error>();
    requireFiles(files).forEach((rawElement, fileName) =>
      elements.set(
        fileName,
        rawElement instanceof Error ? rawElement : this.initElement(rawElement)
      )
    );
    return elements;
  }
}
