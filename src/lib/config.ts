export interface ConfigOptions {
  token: string
  defaultPrefix: string
  generateFolders: boolean
}

export default class Config {

  token: string
  defaultPrefix: string
  generateFolders: boolean

  constructor(options: ConfigOptions | any = {}) {
    this.token = options.token
    this.defaultPrefix = options.defaultPrefix
    this.generateFolders = options.generateFolders || true
  }
}
