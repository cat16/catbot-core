export type InputEventFunc = (input: string) => void;

export interface InputEventCreateInfo {
    trigger?: string,
    func: InputEventFunc
}

export default class InputEvent {
    private trigger: string;
    private func: InputEventFunc;

    constructor(createInfo: InputEventCreateInfo) {
        this.trigger = createInfo.trigger;
        this.func = createInfo.func;
    }

    public run(input: string): boolean {
        if(this.trigger == null || this.trigger.toLowerCase() === input.toLowerCase()) {
            this.func(input);
            return true;
        } else {
            return false;
        }
    }
}