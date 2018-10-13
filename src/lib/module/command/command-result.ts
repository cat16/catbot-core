import { Command } from "eris";

import { ArgList } from "./command";

export default class CommandResult {
    public command: Command;
    public args: ArgList;
    constructor(command: Command, args: ArgList) {
        this.command = command;
        this.args = args;
    }
}
