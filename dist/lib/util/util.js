"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Util {
    constructor(bot) {
        this.bot = bot;
    }
    multiPromise(promises) {
        return new Promise((resolve, reject) => {
            let results = [];
            let finished = 0;
            let check = () => {
                finished++;
                if (finished === promises.length)
                    resolve(results);
            };
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(data => {
                    results[i] = data;
                    check();
                }, err => {
                    results[i] = err;
                    check();
                });
            }
        });
    }
    getUser(userString) {
        if (userString.startsWith('<@') && userString.endsWith('>'))
            userString = userString.slice(2, -1);
        if (userString.startsWith('!'))
            userString = userString.slice(1);
        let user = this.bot.client.users.find(u => { return u.id === userString; });
        if (user)
            return user;
        else
            return null;
    }
    getChannel(channelString) {
        if (channelString.startsWith('<#') && channelString.endsWith('>'))
            channelString = channelString.slice(2, -1);
        let channel = this.bot.client.getChannel(channelString);
        if (channel)
            return channel;
        else
            return null;
    }
    getChannelWithType(channelString, id) {
        let channel = this.getChannel(channelString);
        if (channel && channel.type === 0)
            return channel;
        else
            return null;
    }
    getTextChannel(channelString) {
        return this.getChannelWithType(channelString, 0);
    }
    getDMChannel(channelString) {
        return this.getChannelWithType(channelString, 1);
    }
    getVoiceChannel(channelString) {
        return this.getChannelWithType(channelString, 2);
    }
}
exports.default = Util;
