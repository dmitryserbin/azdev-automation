import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IBuildHelper } from "../helpers/ibuildhelper";
import { IBuildUpdater } from "./ibuildupdater";
import { IBuildPermission } from "../readers/iconfigurationreader";
import { IHelper } from "../common/ihelper";
import { INamespace, ISecurityHelper, ISecurityIdentity } from "../helpers/isecurityhelper";
import { ILogger } from "../loggers/ilogger";
import { IDebug } from "../loggers/idebug";

export class BuildUpdater implements IBuildUpdater {

    private logger: ILogger;
    private debugLogger: IDebug;

    public buildHelper: IBuildHelper;
    public securityHelper: ISecurityHelper;
    private helper: IHelper;

    constructor(buildHelper: IBuildHelper, securityHelper: ISecurityHelper, helper: IHelper, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.buildHelper = buildHelper;
        this.securityHelper = securityHelper;
        this.helper = helper;

    }

    public async updatePermissions(project: TeamProject, policy: IBuildPermission): Promise<void> {

        const debug = this.debugLogger.extend(this.updatePermissions.name);

        this.logger.log(`Applying <${policy.name}> build permissions policy`);

        const namespace: INamespace = await this.securityHelper.getNamespace("Build");
        const permissionSetId: string = namespace.namespaceId;
        const permissionSetToken: string = project.id!;

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
