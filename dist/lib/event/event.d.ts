import Catbot from '../bot';
import { Element } from '../handler';
export declare type BotEventFunction = (data: any, bot: Catbot) => Promise<void> | void;
export interface BotEventOptions {
    run: BotEventFunction;
}
export default class BotEvent implements Element {
    fileName: string;
    path: string;
    isDefault: boolean;
    getAllElements(): this[];
    runFunc: BotEventFunction;
    constructor(options: BotEventOptions);
    run(data: any, bot: Catbot): Promise<void>;
}
