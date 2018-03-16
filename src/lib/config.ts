export interface ConfigOptions {
  token: string
  ownerID: string
  defaultPrefix: string
  generateFolders: boolean
}

export default class Config {

  token: string
  ownerID: string
  defaultPrefix: string
  generateFolders: boolean

  constructor(options: ConfigOptions | any = {}) {
    this.token = options.token
    this.ownerID = options.ownerID
    this.defaultPrefix = options.defaultPrefix
    this.generateFolders = options.generateFolders || true
  }
}
