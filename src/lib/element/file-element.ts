export default class FileElement {
  private fileName: string;

  constructor(path: string) {
    this.fileName = path;
  }

  public getFileName(): string {
    return this.fileName;
  }
}
