import Debug from "debug";

import { TeamProject } from "azure-devops-node-api/interfaces/CoreInterfaces";
import { Release, ReleaseDefinition } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { TaskDefinition } from "azure-devops-node-api/interfaces/TaskAgentInterfaces";

import { IReleasePermission, ITask } from "../interfaces/readers/configurationreader";
import { IConsoleLogger } from "../interfaces/common/consolelogger";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IHelper } from "../interfaces/common/helper";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";
import { IReleaseUpdater } from "../interfaces/updaters/releaseupdater";
import { INamespace, ISecurityHelper, ISecurityIdentity } from "../interfaces/helpers/securityhelper";
import { ITaskAgentHelper } from "../interfaces/helpers/taskagenthelper";

export class ReleaseUpdater implements IReleaseUpdater {

    public releaseHelper: IReleaseHelper;
    public taskAgentHelper: ITaskAgentHelper;
    public securityHelper: ISecurityHelper;
    private helper: IHelper;

    private debugLogger: Debug.Debugger;
    private logger: IConsoleLogger;

    constructor(releaseHelper: IReleaseHelper, taskAgentHelper: ITaskAgentHelper, securityHelper: ISecurityHelper, helper: IHelper, debugLogger: IDebugLogger, consoleLogger: IConsoleLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);
        this.logger = consoleLogger;

        this.releaseHelper = releaseHelper;
        this.taskAgentHelper = taskAgentHelper;
        this.securityHelper = securityHelper;
        this.helper = helper;

    }

    public async initialize(projectName: string): Promise<void> {

        // Simply getting all release definitions initializes
        // Required classic release pipelines capabilities
        const result = this.releaseHelper.getDefinitions(projectName);

    }

    public async removeDefinitionsArtifact(projectName: string, artifactName: string, artifactType: string, mock?: boolean): Promise<void> {

        const debug = this.debugLogger.extend(this.removeDefinitionsArtifact.name);

        this.logger.log(`Updating <${projectName}> project release definition(s)`);

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

                let version = "latest";

                if (artifact.definitionReference!.defaultVersionType.id === "specificVersionType") {

                    version = artifact.definitionReference!.defaultVersionSpecific.name!;

                }

                this.logger.log(`Removing <${artifact.alias}> artifact <${artifact.definitionReference!.branches.id}> branch <${version}> version`);

                const updatedDefinition: ReleaseDefinition = await this.releaseHelper.removeDefinitionArtifact(definition, artifact.alias!, artifact.type!);

                if (mock) {

                    debug(`Definition <${definition.name}> (${definition.id}) will not be updated (MOCK)`);

                    continue;

                }

                debug(`Updating <${definition.name}> definition <${artifact.alias}> artifact(s)`);

                await this.releaseHelper.updateDefinition(updatedDefinition, projectName);

            }

        }));

    }

    public async removeDefinitionsTasks(name: string, projectName: string, task: ITask, mock?: boolean): Promise<void> {

        const debug = this.debugLogger.extend(this.removeDefinitionsTasks.name);

        this.logger.log(`Updating <${projectName}> project <${name}> release definition(s)`);

        const tasks: TaskDefinition[] = await this.taskAgentHelper.findTasks(task.name);

        if (tasks.length < 0) {

            this.logger.log(`No tasks mathing <${task.name}> filter found`);

            return;

        }

        const filteredDefinitions: ReleaseDefinition[] = await this.releaseHelper.findDefinitionsWithTasks(name, projectName, tasks);

        if (filteredDefinitions.length === 0) {

            debug(`No project <${projectName}> definitions with <${task.name}> task(s) found`);

            return;

        }

        debug(`Found <${projectName}> project <${filteredDefinitions.length}> definitions`);

        for (const definition of filteredDefinitions) {

            const updatedDefinition: ReleaseDefinition = await this.releaseHelper.removeDefinitionTasks(definition, tasks);

            this.logger.log(`${projectName} | ${definition.name} | ${task.name}`);

            if (mock) {

                debug(`Definition <${definition.name}> (${definition.id}) will not be updated (MOCK)`);

                continue;

            }

            debug(`Removing <${definition.name}> definition task(s)`);

            await this.releaseHelper.updateDefinition(updatedDefinition, projectName);

        }

    }

    public async updateDefinitionsTasks(name: string, projectName: string, task: ITask, releases?: boolean, mock?: boolean): Promise<void> {

        const debug = this.debugLogger.extend(this.updateDefinitionsTasks.name);

        this.logger.log(`Scanning <${projectName}> project <${name}> release definition(s)`);

        const tasks: TaskDefinition[] = await this.taskAgentHelper.findTasks(task.name);

        if (tasks.length <= 0) {

            debug(`No tasks mathing <${task.name}> filter found`);

            return;

        }

        debug(`Found <${tasks.length}> task(s) matching <${task.name}> filter`);

        const filteredDefinitions: ReleaseDefinition[] = await this.releaseHelper.findDefinitionsWithTasks(name, projectName, tasks);

        if (filteredDefinitions.length <= 0) {

            debug(`No definitions mathing <${name}> filter found`);

            return;

        }

        debug(`Found <${filteredDefinitions.length}> release definition(s) with matching task(s)`);

        await Promise.all(filteredDefinitions.map(async (definition) => {

            debug(`Updating <${definition.name}> (${definition.id}) definition task(s)`);

            const updatedDefinition: ReleaseDefinition = await this.releaseHelper.updateDefinitionTasks(definition, tasks, task.parameters!, task.filter);

            // Push updated definition only
            if (updatedDefinition.comment) {

                if (mock) {

                    this.logger.log(`Definition <${updatedDefinition.name}> (${definition.id}) update required (MOCK)`);

                } else {

                    this.logger.log(`Updating <${updatedDefinition.name}> (${definition.id}) definition`);

                    await this.releaseHelper.updateDefinition(updatedDefinition, projectName);

                }

            } else {

                debug(`Definition <${updatedDefinition.name}> (${definition.id}) update not required`);

            }

            if (releases) {

                const filteredReleases: Release[] = await this.releaseHelper.findDefinitionReleasesWithTasks(definition.id!, projectName, tasks);

                for (const release of filteredReleases) {

                    debug(`Updating <${release.name}> (${release.id}) release task(s)`);

                    const updatedRelease: Release = await this.releaseHelper.updateReleaseTasks(release, tasks, task.parameters!, task.filter);

                    // Push updated release only
                    if (updatedRelease.comment) {

                        if (mock) {

                            this.logger.log(`Release <${updatedRelease.name}> (${updatedRelease.id}) update required (MOCK)`);

                        } else {

                            this.logger.log(`Updating <${updatedRelease.name}> (${updatedRelease.id}) release`);

                            await this.releaseHelper.updateRelease(updatedRelease, projectName);

                        }

                    } else {

                        debug(`Release <${updatedRelease.name}> (${updatedRelease.id}) update not required`);

                    }

                }

            }

        }));

    }

    public async updatePermissions(project: TeamProject, policy: IReleasePermission): Promise<void> {

        const debug = this.debugLogger.extend(this.updatePermissions.name);

        this.logger.log(`Applying <${policy.name}> release permissions policy`);

        const namespace: INamespace = await this.securityHelper.getNamespace("ReleaseManagement", "View release pipeline");
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
