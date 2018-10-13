export interface ConfigOptions {
  token: string;
  dbURI: string;
  dbUser: string;
  dbPassword: string;
}

export default class Config {

  public token: string;
  public dbURI: string;
  public dbUser: string;
  public dbPassword: string;

  constructor(options: ConfigOptions | any = {}) {
    this.token = options.token;
    this.dbURI = options.dbURI;
    this.dbUser = options.dbUser;
    this.dbPassword = options.dbPassword;
  }
}
