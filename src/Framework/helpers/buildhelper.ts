import Debug from "debug";

import { IBuildApi } from "azure-devops-node-api/BuildApi";

import { IBuildHelper } from "./ibuildhelper";
import { IDebugLogger } from "../loggers/idebuglogger";

export class BuildHelper implements IBuildHelper {

    private buildApi: IBuildApi;
    private debugLogger: Debug.Debugger;

    constructor(buildApi: IBuildApi, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        this.buildApi = buildApi;

    }

}
