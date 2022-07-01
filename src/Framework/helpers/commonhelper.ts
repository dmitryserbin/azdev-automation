import { IDebug } from "../loggers/idebug";
import { ILogger } from "../loggers/ilogger";
import { ICommonHelper } from "./icommonhelper";

export class CommonHelper implements ICommonHelper {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

    }

    public async wait(min: number, max: number): Promise<void> {

        const debug = this.debugLogger.extend(this.wait.name);

        const delay: number = Math.floor(Math.random() * (max - min + 1) + min);

        debug(`Waiting <${delay}> milliseconds`);

        return new Promise((resolve) => setTimeout(resolve, delay));

    }

}
