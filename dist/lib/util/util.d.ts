import { User, AnyChannel, TextChannel, PrivateChannel, VoiceChannel } from 'eris';
import Catbot from '../bot';
export default class Util {
    bot: Catbot;
    constructor(bot: Catbot);
    multiPromise(promises: Promise<any>[]): Promise<any[]>;
    getUser(userString: string): User;
    getChannel(channelString: string): AnyChannel;
    getChannelWithType(channelString: string, id: number): AnyChannel;
    getTextChannel(channelString: string): TextChannel;
    getDMChannel(channelString: string): PrivateChannel;
    getVoiceChannel(channelString: string): VoiceChannel;
}
