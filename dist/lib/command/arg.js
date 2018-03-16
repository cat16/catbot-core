"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ArgOptions {
}
exports.ArgOptions = ArgOptions;
class Arg {
    constructor(options) {
        this.name = options.name;
        this.types = options.types || [ArgType.ANY];
    }
}
exports.default = Arg;
class ArgResult {
    constructor(failed, data, subcontent) {
        this.failed = failed;
        this.data = data;
        this.subcontent = subcontent;
    }
}
exports.ArgResult = ArgResult;
class ArgTypeOptions {
}
exports.ArgTypeOptions = ArgTypeOptions;
class ArgType {
    constructor(options) {
        this.validate = options.validate;
    }
}
ArgType.ANY = new ArgType({
    validate: (text, bot) => {
        let word = text.split(' ')[0];
        return new ArgResult(false, word, text.substring(word.length).trimLeft());
    }
});
ArgType.USER = new ArgType({
    validate: (text, bot) => {
        let parts = text.split(/ (.+)/);
        let user = bot.util.getUser(parts[0]);
        if (user)
            return new ArgResult(false, user, parts[1]);
        else
            return new ArgResult(true, `User ${parts[0]} does not exist or cannot be found`);
    }
});
ArgType.TEXT_CHANNEL = new ArgType({
    validate: (text, bot) => {
        let parts = text.split(/ (.+)/);
        let channel = bot.util.getTextChannel(parts[0]);
        if (channel)
            return new ArgResult(false, channel, parts[1]);
        else
            return new ArgResult(true, `Text channel ${parts[0]} does not exist or cannot be found`);
    }
});
ArgType.DM_CHANNEL = new ArgType({
    validate: (text, bot) => {
        let parts = text.split(/ (.+)/);
        let channel = bot.util.getDMChannel(parts[0]);
        if (channel)
            return new ArgResult(false, channel, parts[1]);
        else
            return new ArgResult(true, `DM channel ${parts[0]} does not exist or cannot be found`);
    }
});
ArgType.VOICE_CHANNEL = new ArgType({
    validate: (text, bot) => {
        let parts = text.split(/ (.+)/);
        let channel = bot.util.getVoiceChannel(parts[0]);
        if (channel)
            return new ArgResult(false, channel, parts[1]);
        else
            return new ArgResult(true, `Voice channel ${parts[0]} does not exist or cannot be found`);
    }
});
ArgType.COMMAND = new ArgType({
    validate: (text, bot) => {
        let result = bot.commandManager.find(text);
        if (result) {
            return new ArgResult(false, result.element, result.content);
        }
        else {
            return new ArgResult(true, `'${text}' is not a command`);
        }
    }
});
exports.ArgType = ArgType;
