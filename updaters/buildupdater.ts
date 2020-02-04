import Debug from "debug";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";

import { IBuildHelper } from "../interfaces/helpers/buildhelper";
import { IBuildUpdater } from "../interfaces/updaters/buildupdater";
import { IBuildPermission, PermissionType } from "../interfaces/readers/configurationreader";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IGraphHelper, IGraphIdentity } from "../interfaces/helpers/graphhelper";
import { IHelper } from "../interfaces/common/helper";
import { IIdentityPermission, INamespace, ISecurityHelper, ISecurityIdentity, ISecurityPermission } from "../interfaces/helpers/securityhelper";

export class BuildUpdater implements IBuildUpdater {

    public buildHelper: IBuildHelper;
    public graphHelper: IGraphHelper;
    public securityHelper: ISecurityHelper;

    private debugLogger: Debug.Debugger;
    private logger: IConsoleLogger;
    private helper: IHelper;

    constructor(buildHelper: IBuildHelper, graphHelper: IGraphHelper, securityHelper: ISecurityHelper, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger, helper: IHelper) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.logger = consoleLogger;
        this.helper = helper;

        this.buildHelper = buildHelper;
        this.graphHelper = graphHelper;
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

            let targetIdentity: ISecurityIdentity = existingIdentities.filter((i) => i.displayName === groupName)[0];

            if (!targetIdentity) {

                debug(`Adding new <${groupName}> group identity`);

                const identity: IGraphIdentity = await this.graphHelper.findIdentity(groupName);

                if (!identity) {

                    throw new Error(`Identity <${groupName}> not found`);

                }

                targetIdentity = await this.securityHelper.addIdentityToPermission(project.id!, identity);

            }

            const identityPermission: IIdentityPermission = await this.securityHelper.getIdentityPermission(project.id!, targetIdentity, permissionSetId, permissionSetToken);

            for (const permission of group.permissions) {

                const targetPermission: ISecurityPermission = identityPermission.permissions.filter((i) => i.displayName.trim() === permission.name)[0];

                if (!targetPermission) {

                    throw new Error(`Permission <${permission.name}> not found`);

                }

                // Some magic to address JSON enum parsing issue
                // To be fixed with configuration reader refactoring
                const type: PermissionType = PermissionType[permission.type.toString() as keyof typeof PermissionType];

                // Skip updating identical permission
                if (targetPermission.permissionId === type && targetPermission.explicitPermissionId === type) {

                    debug(`Permission <${permission.name}> (${permission.type}) is identical`);

                    continue;
                }

                debug(`Configuring <${permission.name}> (${permission.type}) permission`);

                // Slow down parallel calls to address
                // Intermittent API connectivity issues
                await this.helper.wait(500, 1500);

                const updatedPermission: any = await this.securityHelper.setIdentityAccessControl(permissionSetToken, identityPermission, targetPermission, type);

            }

        }));

    }

}
