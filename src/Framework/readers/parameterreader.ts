import meow, { AnyFlags, Result } from "meow";

import { IDebug } from "../loggers/idebug";
import { ILogger } from "../loggers/ilogger";
import { IConsoleParameters, IParameterReader } from "./iparameterreader";

export class ParameterReader implements IParameterReader {

    private debugLogger: IDebug;

    constructor(logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

    }

    public newParameters(usage: string, flags: any): IConsoleParameters {

        const debug = this.debugLogger.extend(this.newParameters.name);

        const options: any = {

            flags,

        };

        const parameters: Result<AnyFlags> = meow(usage, options);

        debug(parameters.flags);

        return parameters.flags;

    }

}
