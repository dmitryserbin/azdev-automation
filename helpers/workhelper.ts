import Debug from "debug";

import { IDebugLogger } from "../interfaces/debuglogger";
import { IWorkHelper } from "../interfaces/workhelper";

export class WorkHelper implements IWorkHelper {

    private debugLogger: Debug.Debugger;

    constructor(debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

    }

}
