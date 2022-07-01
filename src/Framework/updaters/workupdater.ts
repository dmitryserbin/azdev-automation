import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IWorkPermission } from "../readers/iconfigurationreader";
import { ICommonHelper } from "../helpers/icommonhelper";
import { IWorkHelper } from "../helpers/iworkhelper";
import { IWorkUpdater } from "./iworkupdater";
import { INamespace, ISecurityHelper, ISecurityIdentity } from "../helpers/isecurityhelper";
import { ILogger } from "../loggers/ilogger";
import { IDebug } from "../loggers/idebug";

export class WorkUpdater implements IWorkUpdater {

    private logger: ILogger;
    private debugLogger: IDebug;

    public workHelper: IWorkHelper;
    public securityHelper: ISecurityHelper;
    private commonHelper: ICommonHelper;

    constructor(workHelper: IWorkHelper, securityHelper: ISecurityHelper, commonHelper: ICommonHelper, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.workHelper = workHelper;
        this.securityHelper = securityHelper;
        this.commonHelper = commonHelper;

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
            await this.commonHelper.wait(500, 3000);

            const targetIdentity: ISecurityIdentity = await this.securityHelper.getExistingIdentity(groupName, project.id!, existingIdentities);

            await this.securityHelper.updateIdentityPermissions(project.id!, targetIdentity, group.permissions, permissionSetId, permissionSetToken);

        }));

    }

}
