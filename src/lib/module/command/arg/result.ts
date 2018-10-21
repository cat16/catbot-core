export default class ArgResult {
  public failed: boolean;
  public data: string | object;
  public subcontent?: string;

  constructor(failed: boolean, data: string | object, subcontent?: string) {
    this.failed = failed;
    this.data = data;
    this.subcontent = subcontent;
  }
}
