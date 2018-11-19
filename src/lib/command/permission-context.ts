import { Member, User } from "eris";
import RunnableCommand from "./runnable";

export class CommandPermissionContext {
  public command: RunnableCommand;
  public user: User;
  public member?: Member;

  constructor(user: User, command: RunnableCommand, member?: Member) {
    this.command = command;
    this.user = user;
    this.member = member;
  }
}
