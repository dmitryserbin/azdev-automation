import Debug from "debug";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IBuildPermission } from "../readers/iconfigurationreader";
import { IConsoleLogger } from "../common/iconsolelogger";
import { IDebugLogger } from "../loggers/idebuglogger";
import { IHelper } from "../common/ihelper";
import { IRepositoryHelper } from "../helpers/irepositoryhelper";
import { IRepositoryUpdater } from "./irepositoryupdater";
import { INamespace, ISecurityHelper, ISecurityIdentity } from "../helpers/isecurityhelper";

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
