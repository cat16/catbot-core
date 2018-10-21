export default class FileElement {
  private fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  public getFileName(): string {
    return this.fileName;
  }
}
