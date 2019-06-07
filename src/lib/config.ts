export interface ConfigOptions {
  token: string;
  name: string;
}

export default class Config {
  public token: string;
  public name: string;

  constructor(options: ConfigOptions | any = {}) {
    this.token = options.token;
    this.name = options.name;
  }
}
