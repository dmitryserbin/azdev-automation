import Debug from "debug";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IWorkPermission } from "../readers/iconfigurationreader";
import { IConsoleLogger } from "../common/iconsolelogger";
import { IDebugLogger } from "../common/idebuglogger";
import { IHelper } from "../common/ihelper";
import { IWorkHelper } from "../helpers/iworkhelper";
import { IWorkUpdater } from "./iworkupdater";
import { INamespace, ISecurityHelper, ISecurityIdentity } from "../helpers/isecurityhelper";

export class WorkUpdater implements IWorkUpdater {

    public workHelper: IWorkHelper;
    public securityHelper: ISecurityHelper;

    private debugLogger: Debug.Debugger;
    private logger: IConsoleLogger;
    private helper: IHelper;

    constructor(workHelper: IWorkHelper, securityHelper: ISecurityHelper, helper: IHelper, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.logger = consoleLogger;

        this.workHelper = workHelper;
        this.securityHelper = securityHelper;
        this.helper = helper;

    }

    public async updatePermissions(project: TeamProject, policy: IWorkPermission): Promise<void> {

        const debug = this.debugLogger.extend(this.updatePermissions.name);

        this.logger.log(`Applying <${policy.name}> work items permissions policy`);

        const namespace: INamespace = await this.securityHelper.getNamespace("CSS");
        const nodeIdentifier: string = await this.workHelper.getNodeIdentifier(project.id!, "area");
        const permissionSetId: string = namespace.namespaceId;
        const permissionSetToken = `vstfs:///Classification/Node/${nodeIdentifier}`;

        const existingIdentities: ISecurityIdentity[] = await this.securityHelper.getExplicitIdentities(project.id!, permissionSetId, permissionSetToken);

        await Promise.all(policy.definition.map(async (group) => {

            const groupName = `[${project.name}]\\${group.name}`;

            this.logger.log(`Assigninig <${groupName}> group permissions`);

            // Slow down parallel calls to address
            // Intermittent API connectivity issues
            await this.helper.wait(500, 3000);

            const targetIdentity: ISecurityIdentity = await this.securityHelper.getExistingIdentity(groupName, project.id!, existingIdentities);

            await this.securityHelper.updateIdentityPermissions(project.id!, targetIdentity, group.permissions, permissionSetId, permissionSetToken);

        }));

    }

}
