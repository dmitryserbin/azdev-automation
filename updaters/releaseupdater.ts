import Debug from "debug";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { TaskDefinition } from "azure-devops-node-api/interfaces/TaskAgentInterfaces";

import { IReleasePermission, ITask, PermissionType } from "../interfaces/configurationreader";
import { IConsoleLogger } from "../interfaces/consolelogger";
import { IDebugLogger } from "../interfaces/debuglogger";
import { IGraphHelper, IGraphIdentity } from "../interfaces/graphhelper";
import { IHelper } from "../interfaces/helper";
import { IReleaseHelper } from "../interfaces/releasehelper";
import { IReleaseUpdater } from "../interfaces/releaseupdater";
import { IIdentityPermission, INamespace, ISecurityHelper, ISecurityIdentity, ISecurityPermission } from "../interfaces/securityhelper";
import { ITaskAgentHelper } from "../interfaces/taskagenthelper";

export class ReleaseUpdater implements IReleaseUpdater {

    public releaseHelper: IReleaseHelper;
    public taskAgentHelper: ITaskAgentHelper;
    public graphHelper: IGraphHelper;
    public securityHelper: ISecurityHelper;

    private debugLogger: Debug.Debugger;
    private logger: IConsoleLogger;
    private helper: IHelper;

    constructor(releaseHelper: IReleaseHelper, taskAgentHelper: ITaskAgentHelper, graphHelper: IGraphHelper, securityHelper: ISecurityHelper, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger, helper: IHelper) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.logger = consoleLogger;
        this.helper = helper;

        this.releaseHelper = releaseHelper;
        this.taskAgentHelper = taskAgentHelper;
        this.graphHelper = graphHelper;
        this.securityHelper = securityHelper;

    }

    public async removeDefinitionArtifact(projectName: string, artifactName: string, artifactType: string, mock?: boolean): Promise<void> {

        const debug = this.debugLogger.extend("removeDefinitionArtifact");

        this.logger.log(`Configuring <${projectName}> project release defintion(s) (mock: ${mock})`);

        const filteredDefinitions: ReleaseDefinition[] = await this.releaseHelper.findDefinitionsWithArtifact(projectName, artifactName, artifactType);

        if (filteredDefinitions.length === 0) {

            this.logger.log(`No definitions with <${artifactName}> artifact <${artifactType}> found`);

            return;

        }

        this.logger.log(`Found <${filteredDefinitions.length}> definition(s) with matching <${artifactName}> artifact`);

        await Promise.all(filteredDefinitions.map(async (definition) => {

            this.logger.log(`Updating <${definition.name}> definition artifact(s)`);

            const targetArtifacts = definition.artifacts!.filter((a) => a.alias === artifactName);

            for (const artifact of targetArtifacts) {

                let version: string = "latest";

                if (artifact.definitionReference!.defaultVersionType.id === "specificVersionType") {

                    version = artifact.definitionReference!.defaultVersionSpecific.name!;

                }

                this.logger.log(`Removing <${artifact.alias}> artifact <${artifact.definitionReference!.branches.id}> branch <${version}> version`);

                const updatedDefinition: ReleaseDefinition = await this.releaseHelper.removeDefinitionArtifact(definition, artifact.alias!, artifact.type!);

                if (mock) {

                    debug(`Release definition <${definition.name}> will not be updated (MOCK)`);

                    continue;

                }

                debug(`Updating <${definition.name}> definition <${artifact.alias}> artifact(s)`);

                await this.releaseHelper.updateDefinition(updatedDefinition, projectName);

            }

        }));

    }

    public async removeDefinitionTasks(projectName: string, task: ITask, mock?: boolean): Promise<void> {

        const debug = this.debugLogger.extend("removeReleaseDefinitionTask");

        const ids: string[] = await this.getTaskIDs(task.name);

        if (ids.length < 0) {

            this.logger.log(`No ${task.name} tasks found`);

            return;

        }

        const filteredDefinitions: ReleaseDefinition[] = await this.releaseHelper.findDefinitionsWithTasks(projectName, ids);

        if (filteredDefinitions.length === 0) {

            debug(`No project <${projectName}> definitions with <${task.name}> task(s) found`);

            return;

        }

        debug(`Found <${projectName}> project <${filteredDefinitions.length}> definitions`);

        for (const definition of filteredDefinitions) {

            const updatedDefinition: ReleaseDefinition = await this.releaseHelper.removeDefinitionTasks(definition, ids);

            this.logger.log(`${projectName} | ${definition.name} | ${task.name}`);

            if (mock) {

                debug(`Release definition <${definition.name}> will not be updated (MOCK)`);

                continue;

            }

            debug(`Removing <${definition.name}> definition task(s)`);

            await this.releaseHelper.updateDefinition(updatedDefinition, projectName);

        }

    }

    public async updateDefinitionTasks(projectName: string, task: ITask, mock?: boolean): Promise<void> {

        const debug = this.debugLogger.extend("updateReleaseDefinitionTasks");

        this.logger.log(`Configuring <${projectName}> project release defintion(s) (mock: ${mock})`);

        const targetIDs: string[] = await this.getTaskIDs(task.name);

        if (targetIDs.length < 0) {

            this.logger.log(`No <${task.name}> tasks found`);

            return;

        }

        this.logger.log(`Found <${targetIDs.length}> task(s) matching <${task.name}> filter`);

        const filteredDefinitions: ReleaseDefinition[] = await this.releaseHelper.findDefinitionsWithTasks(projectName, targetIDs);

        if (filteredDefinitions.length === 0) {

            debug(`No project <${projectName}> definitions with <${task.name}> task(s) found`);

            return;

        }

        this.logger.log(`Found <${filteredDefinitions.length}> release definition(s) with matching tasks`);

        await Promise.all(filteredDefinitions.map(async (definition) => {

            this.logger.log(`Updating <${definition.name}> definition task(s)`);

            const updatedDefinition: ReleaseDefinition = await this.releaseHelper.updateDefinitionTasks(definition, targetIDs, task.parameters!);

            if (mock) {

                debug(`Definition <${updatedDefinition.name}> will not be updated (MOCK)`);

                return;

            }

            debug(`Updating <${updatedDefinition.name}> definition tasks parameters`);

            await this.releaseHelper.updateDefinition(updatedDefinition, projectName);

        }));

    }

    public async updatePermissions(project: TeamProject, policy: IReleasePermission): Promise<void> {

        const debug = this.debugLogger.extend("updatePermissions");

        this.logger.log(`Applying <${policy.name}> release permissions policy`);

        const namespace: INamespace = await this.securityHelper.getNamespace("ReleaseManagement", "View release pipeline");
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

    private async getTaskIDs(name: string): Promise<string[]> {

        const result: string[] = [];

        const tasks: TaskDefinition[] = await this.taskAgentHelper.findTasks(name);

        if (tasks.length > 0) {

            tasks.map((t) => result.push(t.id!));

        }

        return result;

    }

}
