import Catbot from '../bot';
export declare class ArgOptions {
    name: string;
    types?: ArgType[];
}
export default class Arg {
    name: string;
    types: ArgType[];
    constructor(options: ArgOptions);
}
export declare class ArgResult {
    failed: boolean;
    data: string | object;
    subcontent?: string;
    constructor(failed: boolean, data: string | object, subcontent?: string);
}
export declare type ValidateFunction = (text: string, bot: Catbot) => ArgResult;
export declare class ArgTypeOptions {
    validate: ValidateFunction;
}
export declare class ArgType {
    validate: ValidateFunction;
    constructor(options: ArgTypeOptions);
    static ANY: ArgType;
    static USER: ArgType;
    static TEXT_CHANNEL: ArgType;
    static DM_CHANNEL: ArgType;
    static VOICE_CHANNEL: ArgType;
    static COMMAND: ArgType;
}
