import Debug from "debug";
import meow from "meow";

import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IConsoleParameters, IParameterReader } from "../interfaces/readers/parameterreader";

export class ParameterReader implements IParameterReader {

    private debugLogger: Debug.Debugger;

    constructor(debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

    }

    public newParameters(usage: string, flags: any): IConsoleParameters {

        const debug = this.debugLogger.extend(this.newParameters.name);

        const options: meow.Options = {

            flags: flags,

        };

        const parameters: meow.Result = meow(usage, options);

        debug(parameters.flags);

        return parameters.flags;

    }

}
