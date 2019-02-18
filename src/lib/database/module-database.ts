export default abstract class ModuleDatabase {
  private static currentId: number = 0;

  private readonly id: number;

  constructor() {
    this.id = ModuleDatabase.currentId++;
  }

  /**
   * Gets a value from the database using a key.
   * This should return undefined if the key is not in the database.
   * @param key - the key of the value
   */
  public abstract async get(key: string): Promise<any>;

  /**
   * Sets a key to a value in the database
   * @param key - the key for the value
   * @param value - the value you want to set
   */
  public abstract async set(key: string, value: any): Promise<void>;

  /**
   * Deletes a key in the database
   * @param key - the key you want to delete
   * @returns the value before it was deleted
   */
  public abstract async delete(key: string): Promise<any>;

  public getId(): number {
    return this.id;
  }
}
