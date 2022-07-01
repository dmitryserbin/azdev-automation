import Debug from "debug";

import { IGitApi } from "azure-devops-node-api/GitApi";

import { IDebugLogger } from "../loggers/idebuglogger";
import { IRepositoryHelper } from "./irepositoryhelper";

export class RepositoryHelper implements IRepositoryHelper {

    private gitApi: IGitApi;
    private debugLogger: Debug.Debugger;

    constructor(gitApi: IGitApi, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        this.gitApi = gitApi;

    }

}
