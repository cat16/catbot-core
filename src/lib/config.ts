export interface ConfigOptions {
  token: string;
}

export default class Config {
  public token: string;

  constructor(options: ConfigOptions | any = {}) {
    this.token = options.token;
  }
}
