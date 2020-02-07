import Debug from "debug";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { IBuildUpdater } from "../interfaces/updaters/buildupdater";
import { IBuildPermission } from "../interfaces/readers/configurationreader";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IHelper } from "../interfaces/common/helper";
import { INamespace, ISecurityHelper, ISecurityIdentity } from "../interfaces/helpers/securityhelper";

export class BuildUpdater implements IBuildUpdater {

    public buildHelper: IBuildHelper;
    public securityHelper: ISecurityHelper;

    private debugLogger: Debug.Debugger;
    private logger: IConsoleLogger;
    private helper: IHelper;

    constructor(buildHelper: IBuildHelper, securityHelper: ISecurityHelper, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger, helper: IHelper) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.logger = consoleLogger;
        this.helper = helper;

        this.buildHelper = buildHelper;
        this.securityHelper = securityHelper;

    }

    public async updatePermissions(project: TeamProject, policy: IBuildPermission): Promise<void> {

        const debug = this.debugLogger.extend("updatePermissions");

        this.logger.log(`Applying <${policy.name}> build permissions policy`);

        const namespace: INamespace = await this.securityHelper.getNamespace("Build");
        const permissionSetId: string = namespace.namespaceId;
        const permissionSetToken: string = project.id!;

        const existingIdentities: ISecurityIdentity[] = await this.securityHelper.getExplicitIdentities(project.id!, permissionSetId, permissionSetToken);

        await Promise.all(policy.definition.map(async (group) => {

            const groupName: string = `[${project.name}]\\${group.name}`;

            this.logger.log(`Assigninig <${groupName}> group permissions`);

            // Slow down parallel calls to address
            // Intermittent API connectivity issues
            await this.helper.wait(500, 3000);

            let targetIdentity: ISecurityIdentity = await this.securityHelper.getExistingIdentity(groupName, project.id!, existingIdentities);

            await this.securityHelper.updateIdentityPermissions(project.id!, targetIdentity, group.permissions, permissionSetId, permissionSetToken);

        }));

    }

}
