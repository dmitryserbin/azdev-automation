import Debug from "debug";

import * as ga from "azure-devops-node-api/GitApi";

import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IRepositoryHelper } from "../interfaces/helpers/repositoryhelper";

export class RepositoryHelper implements IRepositoryHelper {

    private gitApi: ga.IGitApi;
    private debugLogger: Debug.Debugger;

    constructor(gitApi: ga.IGitApi, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        this.gitApi = gitApi;

    }

}
