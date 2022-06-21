import Debug from "debug";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IBuildPermission } from "../interfaces/readers/configurationreader";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IHelper } from "../interfaces/common/helper";
import { IRepositoryHelper } from "../interfaces/helpers/repositoryhelper";
import { IRepositoryUpdater } from "../interfaces/updaters/repositoryupdater";
import { INamespace, ISecurityHelper, ISecurityIdentity } from "../interfaces/helpers/securityhelper";

export class RepositoryUpdater implements IRepositoryUpdater {

    public repositoryHelper: IRepositoryHelper;
    public securityHelper: ISecurityHelper;
    private helper: IHelper;

    private debugLogger: Debug.Debugger;
    private logger: IConsoleLogger;

    constructor(repositoryHelper: IRepositoryHelper, securityHelper: ISecurityHelper, helper: IHelper, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.logger = consoleLogger;

        this.repositoryHelper = repositoryHelper;
        this.securityHelper = securityHelper;
        this.helper = helper;

    }

    public async updatePermissions(project: TeamProject, policy: IBuildPermission): Promise<void> {

        const debug = this.debugLogger.extend(this.updatePermissions.name);

        this.logger.log(`Applying <${policy.name}> repository permissions policy`);

        const namespace: INamespace = await this.securityHelper.getNamespace("Git Repositories");
        const permissionSetId: string = namespace.namespaceId;
        const permissionSetToken = `repoV2/${project.id!}/`;

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
