import { GuildMember, User } from "discord.js";
import RunnableCommand from "./runnable";

export class CommandPermissionContext {
  public command: RunnableCommand;
  public user: User;
  public member?: GuildMember;

  constructor(user: User, command: RunnableCommand, member?: GuildMember) {
    this.command = command;
    this.user = user;
    this.member = member;
  }
}
