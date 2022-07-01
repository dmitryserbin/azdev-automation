import { IGitApi } from "azure-devops-node-api/GitApi";

import { IDebug } from "../loggers/idebug";
import { ILogger } from "../loggers/ilogger";
import { IRepositoryHelper } from "./irepositoryhelper";

export class RepositoryHelper implements IRepositoryHelper {

    private debugLogger: IDebug;

    private gitApi: IGitApi;

    constructor(gitApi: IGitApi, logger: ILogger) {

        this.debugLogger = logger.extend(this.constructor.name);

        this.gitApi = gitApi;

    }

}
