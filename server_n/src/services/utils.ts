import * as crypto from 'crypto';

export class Utils {
    private _controllers: Record<string, any> = {};
    constructor() {

    }
    get<T extends keyof typeof this._controllers>(name: T): typeof this._controllers[T] {
        const ControlClass = this._controllers[name];
        if (!ControlClass) {
        throw new Error(`No found for name "${name}".`);
        }
        return ControlClass;
    }

    registController<T>(name: string, control: T): void {
        if (name in this._controllers) {
            throw new Error('[name] Duplicate regist');
        }
        this._controllers[name] = control;
    }

    static hashPassword(password: string) {
        const hash = crypto.createHash('sha512').update(password).digest('hex');

        return hash;
    }
}