import { ElementGenerationFunction, RecursiveElementLoader } from "../../handler";

import { Command } from "eris";

import { CommandGroup, CommandOrGroup } from "./command";

export class CommandLoader extends RecursiveElementLoader<Command, CommandGroup> {
    constructor(directory: string, parent?: CommandOrGroup) {
        super(
            directory,
            (rawElement) => {
                return new rawElement();
            },
            {
                parent,
                generateGroup: (path: string, generateElement: ElementGenerationFunction<Command>) => new CommandGroup(path, generateElement),
            },
        );
    }

    public generateGroup(path, generateElement): CommandGroup {
        return new CommandGroup(path, generateElement);
    }
}
