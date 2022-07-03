import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IBuildPermission } from "../readers/iconfigurationreader";
import { ICommonHelper } from "../helpers/icommonhelper";
import { IRepositoryHelper } from "../helpers/irepositoryhelper";
import { IRepositoryUpdater } from "./irepositoryupdater";
import { INamespace, ISecurityHelper, ISecurityIdentity } from "../helpers/isecurityhelper";
import { ILogger } from "../loggers/ilogger";
import { IDebug } from "../loggers/idebug";

export class RepositoryUpdater implements IRepositoryUpdater {

    private logger: ILogger;
    private debugLogger: IDebug;

    public repositoryHelper: IRepositoryHelper;
    public securityHelper: ISecurityHelper;
    private commonHelper: ICommonHelper;

    constructor(repositoryHelper: IRepositoryHelper, securityHelper: ISecurityHelper, commonHelper: ICommonHelper, logger: ILogger) {

        this.logger = logger;
        this.debugLogger = logger.extend(this.constructor.name);

        this.repositoryHelper = repositoryHelper;
        this.securityHelper = securityHelper;
        this.commonHelper = commonHelper;

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
            await this.commonHelper.wait(500, 3000);

            const targetIdentity: ISecurityIdentity = await this.securityHelper.getExistingIdentity(groupName, project.id!, existingIdentities);

            await this.securityHelper.updateIdentityPermissions(project.id!, targetIdentity, group.permissions, permissionSetId, permissionSetToken);

        }));

    }

}
