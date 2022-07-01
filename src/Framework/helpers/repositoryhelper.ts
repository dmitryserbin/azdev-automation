import Debug from "debug";

import * as ga from "azure-devops-node-api/GitApi";

import { IDebugLogger } from "../common/idebuglogger";
import { IRepositoryHelper } from "./irepositoryhelper";

export class RepositoryHelper implements IRepositoryHelper {

    private gitApi: ga.IGitApi;
    private debugLogger: Debug.Debugger;

    constructor(gitApi: ga.IGitApi, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        this.gitApi = gitApi;

    }

}
