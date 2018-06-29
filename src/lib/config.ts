export interface ConfigOptions {
  token: string
  defaultPrefix: string
  generateFolders: boolean
}

export default class Config {

  token: string
  generateFolders: boolean

  constructor(options: ConfigOptions | any = {}) {
    this.token = options.token
    this.generateFolders = options.generateFolders || true
  }
}
