"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BotEvent {
    getAllElements() {
        return [this];
    }
    constructor(options) {
        this.runFunc = options.run;
    }
    run(data, bot) {
        return new Promise((resolve, reject) => {
            if (this.runFunc == null) {
                reject(new Error('no run function provided'));
                return;
            }
            try {
                let result = this.runFunc(data, bot);
                if (result instanceof Promise) {
                    result.then(() => {
                        resolve();
                    }, (reason) => {
                        reject(reason);
                    });
                }
                else {
                    resolve();
                }
            }
            catch (ex) {
                reject(ex);
            }
        });
    }
}
exports.default = BotEvent;
