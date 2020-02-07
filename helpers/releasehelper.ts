import Debug from "debug";

import * as ra from "azure-devops-node-api/ReleaseApi";

import { Artifact, ReleaseDefinition, WorkflowTask } from "azure-devops-node-api/interfaces/ReleaseInterfaces";
import { IDebugLogger } from "../interfaces/common/debuglogger";
import { IReleaseHelper } from "../interfaces/helpers/releasehelper";

export class ReleaseHelper implements IReleaseHelper {

    private releaseApi: ra.IReleaseApi;
    private debugLogger: Debug.Debugger;

    constructor(releaseApi: ra.IReleaseApi, debugLogger: IDebugLogger) {

        this.debugLogger = debugLogger.create(this.constructor.name);

        this.releaseApi = releaseApi;

    }

    public async findDefinitionsWithArtifact(projectName: string, artifactName: string, artifactType: string): Promise<ReleaseDefinition[]> {

        const debug = this.debugLogger.extend(this.findDefinitionsWithArtifact.name);

        const result: ReleaseDefinition[] = [];
        const projectDefinitions: ReleaseDefinition[] = await this.releaseApi.getReleaseDefinitions(projectName);

        debug(`Found ${projectName} project ${projectDefinitions.length} definitions`);

        for (const definitioin of projectDefinitions) {

            const targetDefinition: ReleaseDefinition = await this.releaseApi.getReleaseDefinition(projectName, definitioin.id!);

            const exists: boolean = targetDefinition.artifacts!.some((a) => a.alias === artifactName && a.type === artifactType);

            if (exists) {

                debug(`Artifact ${artifactName} found`);

                result.push(targetDefinition);

            }

        }

        debug(`Found ${result.length} filtered definitions`);

        return result;

    }

    public async findDefinitionsWithTasks(projectName: string, taskIDs: string[]): Promise<ReleaseDefinition[]> {

        const debug = this.debugLogger.extend(this.findDefinitionsWithTasks.name);

        const result: ReleaseDefinition[] = [];
        const projectDefinitions: ReleaseDefinition[] = await this.releaseApi.getReleaseDefinitions(projectName);

        debug(`Found ${projectName} project ${projectDefinitions.length} definitions`);

        debug(taskIDs);

        await Promise.all(projectDefinitions.map(async (definition) => {

            const targetDefinition: ReleaseDefinition = await this.releaseApi.getReleaseDefinition(projectName, definition.id!);

            const exists: boolean = targetDefinition.environments!
                .some((e) => e.deployPhases!.some((p) => p.workflowTasks!.some((t) => taskIDs.some((i) => i === t.taskId))));

            if (exists) {

                debug(`Task(s) found`);

                result.push(targetDefinition);

            }

        }));

        debug(`Found ${result.length} filtered definitions`);

        return result;

    }

    public async removeDefinitionTasks(definition: ReleaseDefinition, taskIDs: string[]): Promise<ReleaseDefinition> {

        const debug = this.debugLogger.extend(this.removeDefinitionTasks.name);

        const removedTasks: string[] = [];

        for (const stage of definition.environments!) {

            for (const phase of stage.deployPhases!) {

                const updatedTasks: WorkflowTask[] = [];

                for (const task of phase.workflowTasks!) {

                    if (taskIDs.some((t) => t === task.taskId)) {

                        debug(`Removing ${stage.name} stage ${task.name} task`);

                        if (!removedTasks.includes(task.name!)) {

                            removedTasks.push(task.name!);

                        }

                        continue;

                    }

                    updatedTasks.push(task);

                }

                phase.workflowTasks = updatedTasks;

            }

        }

        if (removedTasks.length > 0) {

            definition.comment = `Remove ${removedTasks.join(", ")} task(s)`;

        }

        return definition;

    }

    public async updateDefinitionTasks(definition: ReleaseDefinition, taskIDs: string[], taskParameters: { [name: string]: any }): Promise<ReleaseDefinition> {

        const debug = this.debugLogger.extend(this.updateDefinitionTasks.name);

        const updatedTasks: string[] = [];

        for (const stage of definition.environments!) {

            for (const phase of stage.deployPhases!) {

                const stageTasks: WorkflowTask[] = [];

                for (const task of phase.workflowTasks!) {

                    if (taskIDs.some((t) => t === task.taskId)) {

                        debug(`Updating ${stage.name} stage ${task.name} task`);

                        if (!updatedTasks.includes(task.name!)) {

                            updatedTasks.push(task.name!);

                        }

                        for (const parameter of Object.keys(taskParameters)) {

                            if (task.inputs!.hasOwnProperty(parameter)) {

                                debug(`Updating existing input ${parameter} parameter`);

                            } else {

                                debug(`Adding new input ${parameter} parameter`);

                            }

                            task.inputs![parameter] = taskParameters[parameter];

                        }

                    }

                    stageTasks.push(task);

                }

                phase.workflowTasks = stageTasks;

            }

        }

        if (updatedTasks.length > 0) {

            definition.comment = `Update ${updatedTasks.join(", ")} task(s)`;

        }

        return definition;

    }

    public async removeDefinitionArtifact(definition: ReleaseDefinition, artifactName: string, artifactType: string): Promise<ReleaseDefinition> {

        const debug = this.debugLogger.extend(this.removeDefinitionArtifact.name);

        const updatedArtifacts: Artifact[] = [];

        for (const artifact of definition.artifacts!) {

            if (artifact.alias === artifactName && artifact.type === artifactType) {

                debug(`Removing ${artifact.alias} type ${artifact.type} artifact`);

                continue;

            }

            updatedArtifacts.push(artifact);

        }

        definition.artifacts = updatedArtifacts;
        definition.comment = `Remove <${artifactName}> artifact`;

        return definition;

    }

    public async updateDefinition(definition: ReleaseDefinition, projectName: string): Promise<void> {

        const debug = this.debugLogger.extend(this.updateDefinition.name);

        debug(`Updating ${projectName} project ${definition.name} definition`);

        await this.releaseApi.updateReleaseDefinition(definition, projectName);

    }

}
