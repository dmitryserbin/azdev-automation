import Debug from "debug";

import * as ba from "azure-devops-node-api/BuildApi";

import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { IDebugLogger } from "../interfaces/common/debuglogger";

export class BuildHelper implements IBuildHelper {

    private buildApi: ba.IBuildApi;
    private debugLogger: Debug.Debugger;

    constructor(buildApi: ba.IBuildApi, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        this.buildApi = buildApi;

    }

}
