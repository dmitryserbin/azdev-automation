import Debug from "debug";

import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IHelper } from "../interfaces/common/helper";

export class Helper implements IHelper {

    private debugLogger: Debug.Debugger;

    constructor(debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

    }

    public async wait(min: number, max: number): Promise<void> {

        const delay: number = Math.floor(Math.random() * (max - min + 1) + min);

        return new Promise((resolve) => setTimeout(resolve, delay));

    }

}
