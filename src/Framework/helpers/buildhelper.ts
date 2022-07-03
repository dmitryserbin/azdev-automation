import { IBuildApi } from "azure-devops-node-api/BuildApi";

import { IDebug } from "../loggers/idebug";
import { ILogger } from "../loggers/ilogger";
import { IBuildHelper } from "./ibuildhelper";

export class BuildHelper implements IBuildHelper {

    private debugLogger: IDebug;

    private buildApi: IBuildApi;

    constructor(buildApi: IBuildApi, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.buildApi = buildApi;

    }

}
