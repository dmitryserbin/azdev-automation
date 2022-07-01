import Debug from "debug";
import meow, { AnyFlags, Result } from "meow";

import { IDebugLogger } from "../common/idebuglogger";
import { IConsoleParameters, IParameterReader } from "./iparameterreader";

export class ParameterReader implements IParameterReader {

    private debugLogger: Debug.Debugger;

    constructor(debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

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
