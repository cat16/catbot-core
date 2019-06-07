import FileElement from ".";

export default abstract class RecursiveFileElement<
  T extends RecursiveFileElement<T>
> extends FileElement {
  public get children(): T[] {
    return this._children;
  }

  public get filePath(): string {
    return this.getFilePath();
  }

  private _parent?: T;

  public get parent(): T {
    return this._parent;
  }
  private _children: T[];

  constructor(fileName: string, parent?: T) {
    super(fileName);
    this._children = [];
    this._parent = parent;
  }

  public getFilePath(separator: string = "/"): string {
    return this.parent
      ? this.parent.getFilePath(separator) + separator + this.fileName
      : this.fileName;
  }

  public removeChild(child: T): void {
    const childIndex = this.children.findIndex(
      c => c.fileName === child.fileName
    );
    if (childIndex === -1) {
      return;
    }
    this.children.splice(childIndex, 1);
  }

  public replaceChild(child: T): T {
    const index = this.children.findIndex(c => c.fileName === child.fileName);
    if (index === -1) {
      return null;
    } else {
      const oldChild = this.children[index];
      this.children[index] = child;
      return oldChild;
    }
  }
}
