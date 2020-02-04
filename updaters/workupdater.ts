import Debug from "debug";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IWorkPermission } from "../interfaces/configurationreader";
import { IConsoleLogger } from "../interfaces/consolelogger";
import { IDebugLogger } from "../interfaces/debuglogger";
import { IHelper } from "../interfaces/helper";
import { IWorkHelper } from "../interfaces/workhelper";
import { IWorkUpdater } from "../interfaces/workupdater";
import { INamespace, ISecurityHelper, ISecurityIdentity } from "../interfaces/securityhelper";

export class WorkUpdater implements IWorkUpdater {

    public workHelper: IWorkHelper;
    public securityHelper: ISecurityHelper;

    private debugLogger: Debug.Debugger;
    private logger: IConsoleLogger;
    private helper: IHelper;

    constructor(workHelper: IWorkHelper, securityHelper: ISecurityHelper, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger, helper: IHelper) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.logger = consoleLogger;
        this.helper = helper;

        this.workHelper = workHelper;
        this.securityHelper = securityHelper;

    }

    public async updatePermissions(project: TeamProject, policy: IWorkPermission): Promise<void> {

        const debug = this.debugLogger.extend("updatePermissions");

        this.logger.log(`Applying <${policy.name}> work items permissions policy`);

        const namespace: INamespace = await this.securityHelper.getNamespace("CSS");
        const permissionSetId: string = namespace.namespaceId;
        const permissionSetToken: string = `vstfs:///Classification/Node/${project.id!}`;

    }

}
