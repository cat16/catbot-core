export interface ConfigOptions {
  token: string
}

export default class Config {

  token: string

  constructor(options: ConfigOptions | any = {}) {
    this.token = options.token
  }
}
