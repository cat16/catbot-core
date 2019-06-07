export default class FileElement {
  private _fileName: string;

  constructor(fileName: string) {
    this._fileName = fileName;
  }

  get fileName(): string {
    return this._fileName;
  }
}
