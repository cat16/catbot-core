import IgnoredError from ".";

export default class IgnoredForCooldownError extends IgnoredError {
  constructor() {
    super("The cooldown is still active");
  }
}
