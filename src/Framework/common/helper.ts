import { IDebug } from "../loggers/idebug";
import { ILogger } from "../loggers/ilogger";
import { IHelper } from "./ihelper";

export class Helper implements IHelper {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

    }

    public async wait(min: number, max: number): Promise<void> {

        const delay: number = Math.floor(Math.random() * (max - min + 1) + min);

        return new Promise((resolve) => setTimeout(resolve, delay));

    }

}
